import "dotenv/config";
process.env.NODE_ENV = "test";
import mongoose from "mongoose";
const { default: app } = await import("./server.js");
import User from "./src/models/User.js";
import Building from "./src/models/Building.js";
import Favorite from "./src/models/Favorite.js";
import Report from "./src/models/Report.js";
import SiteSettings from "./src/models/SiteSettings.js";
import { connectDB } from "./src/config/db.js";

async function runTests() {
  console.log("=== STARTING FULL PERSISTENCE & AUTH INTEGRATION TESTS ===");
  await connectDB();

  const server = app.listen(5099);
  const baseUrl = "http://localhost:5099";

  const assert = (condition, msg) => {
    if (!condition) {
      console.error("FAIL:", msg);
      throw new Error("Assertion failed: " + msg);
    }
    console.log("PASS:", msg);
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, "Health endpoint returns 200");
    assert(health.database === "connected", "Health reports database: connected");

    // Clean up test data
    const testUserEmail = `test_student_${Date.now()}@psit.ac.in`;
    const testAdminEmail = `testadmin_${Date.now()}@psit.ac.in`;
    process.env.ADMIN_EMAILS = `admin@psit.ac.in,shauryarajput930@gmail.com,${testAdminEmail}`;
    const fakeAdminEmail = `admin_imposter_${Date.now()}@gmail.com`;

    await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail, fakeAdminEmail] } });
    await Building.deleteOne({ id: "test-block-x" });

    // 2. User Registration (Student)
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Student", email: testUserEmail, password: "password123" }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "Registration returns 201 Created");
    assert(Boolean(regData.token), "Registration returns JWT token");
    assert(regData.user.role === "user", "Student registered with role 'user'");

    // Verify user actually in MongoDB
    const dbUser = await User.findOne({ email: testUserEmail });
    assert(Boolean(dbUser), "User document exists in MongoDB");
    assert(dbUser.name === "Test Student", "User name is saved accurately in MongoDB");

    // 3. Duplicate Registration fails with 409
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Student", email: testUserEmail, password: "password123" }),
    });
    assert(dupRes.status === 409, "Duplicate registration rejected with 409");

    // 4. User Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUserEmail, password: "password123" }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "Login returns 200 OK");
    assert(Boolean(loginData.token), "Login returns JWT token");
    const studentToken = loginData.token;

    // 5. Wrong password fails
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUserEmail, password: "wrongpassword" }),
    });
    assert(badLoginRes.status === 401, "Invalid password returns 401");

    // 6. /api/auth/me returns real persisted user
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, "/api/auth/me returns 200");
    assert(meData.email === testUserEmail, "/api/auth/me returned actual DB user email");
    assert(meData.id === dbUser._id.toString(), "/api/auth/me returned actual MongoDB _id");

    // 7. Admin Authorization Checks
    // 7a. Normal student cannot access admin route
    const forbidRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(forbidRes.status === 403, "Student cannot access /api/admin/users (403 Forbidden)");

    // 7b. Imposter with 'admin' in email cannot access admin route
    const imposterRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Imposter", email: fakeAdminEmail, password: "password123" }),
    });
    const imposterData = await imposterRes.json();
    const imposterToken = imposterData.token;
    const imposterAdminCheck = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${imposterToken}` },
    });
    assert(imposterAdminCheck.status === 403, "User with 'admin' in email is denied admin access (403 Forbidden)");

    // 7c. Real Admin Registration and Login
    const adminRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Campus Admin", email: testAdminEmail, password: "adminpassword123" }),
    });
    const adminRegData = await adminRegRes.json();
    assert(adminRegData.user.role === "admin", "admin@psit.ac.in is recognized as admin role");
    const adminToken = adminRegData.token;

    const adminCheckRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminCheckRes.status === 200, "Admin can access /api/admin/users (200 OK)");

    // 8. Building CRUD in MongoDB
    // Create Building
    const createBRes = await fetch(`${baseUrl}/api/buildings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        id: "test-block-x",
        name: "Test Research Block X",
        code: "TRB-X",
        department: "Computer Science & Engineering",
        description: "Test building for verification",
        category: "academic",
        lat: 26.4501,
        lng: 80.1921,
        floors: 3,
        facilities: ["Lab X", "Smart Room"],
        rooms: [{ number: "X-101", type: "Research Lab", floor: 1 }],
      }),
    });
    assert(createBRes.status === 201, "Admin creates building: 201 Created");

    // Verify in MongoDB
    const dbBuilding = await Building.findOne({ id: "test-block-x" });
    assert(Boolean(dbBuilding), "Building persisted directly in MongoDB");
    assert(dbBuilding.code === "TRB-X", "Building code stored in MongoDB");

    // Update Building
    const updateBRes = await fetch(`${baseUrl}/api/buildings/test-block-x`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        description: "Updated description in MongoDB",
        floors: 4,
      }),
    });
    assert(updateBRes.status === 200, "Admin updates building: 200 OK");
    const updatedDbBuilding = await Building.findOne({ id: "test-block-x" });
    assert(updatedDbBuilding.description === "Updated description in MongoDB", "Building update persisted in MongoDB");
    assert(updatedDbBuilding.floors === 4, "Building floors updated in MongoDB");

    // 9. Favorites Persistence in MongoDB
    // Add favorite
    const favAddRes = await fetch(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ buildingId: "test-block-x" }),
    });
    const favAddData = await favAddRes.json();
    assert(favAddRes.status === 200, "Favorite toggle returns 200 OK");
    assert(favAddData.favorited === true, "Building favorited successfully");
    assert(favAddData.favorites.includes("test-block-x"), "Returned favorites array contains test-block-x");

    // Verify in MongoDB Favorite collection
    const dbFav = await Favorite.findOne({ userId: dbUser._id, buildingId: "test-block-x" });
    assert(Boolean(dbFav), "Favorite document saved in MongoDB Favorite collection");

    // Retrieve favorites for user
    const getFavRes = await fetch(`${baseUrl}/api/favorites`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const getFavData = await getFavRes.json();
    assert(getFavData.includes("test-block-x"), "GET /api/favorites returns MongoDB favorite");

    // Unfavorite
    const favRemoveRes = await fetch(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ buildingId: "test-block-x" }),
    });
    const favRemoveData = await favRemoveRes.json();
    assert(favRemoveData.favorited === false, "Favorite toggled off");
    const dbFavAfter = await Favorite.findOne({ userId: dbUser._id, buildingId: "test-block-x" });
    assert(!dbFavAfter, "Favorite removed from MongoDB Favorite collection");

    // Re-add favorite for analytics test
    await fetch(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ buildingId: "test-block-x" }),
    });

    // 10. Reports in MongoDB
    const reportCreateRes = await fetch(`${baseUrl}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        buildingId: "test-block-x",
        buildingName: "Test Research Block X",
        category: "details",
        message: "Room number typo on floor 1",
      }),
    });
    const reportCreateData = await reportCreateRes.json();
    assert(reportCreateRes.status === 201, "User creates report: 201 Created");
    assert(Boolean(reportCreateData._id), "Report document created in MongoDB");

    // User gets own reports
    const myReportsRes = await fetch(`${baseUrl}/api/reports/my`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myReportsData = await myReportsRes.json();
    assert(myReportsData.some((r) => r.buildingId === "test-block-x"), "User retrieves report from MongoDB");

    // Admin reviews and patches report
    const patchReportRes = await fetch(`${baseUrl}/api/reports/${reportCreateData._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "resolved" }),
    });
    assert(patchReportRes.status === 200, "Admin updates report status: 200 OK");
    const dbReport = await Report.findById(reportCreateData._id);
    assert(dbReport.status === "resolved", "Report status updated to 'resolved' in MongoDB");

    // 11. Admin Analytics from MongoDB
    const analyticsRes = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, "Admin analytics returns 200 OK");
    assert(analyticsData.totalUsers >= 2, "Analytics reflects real user count in MongoDB");
    assert(analyticsData.resolvedReports >= 1, "Analytics reflects resolved report count in MongoDB");
    assert(analyticsData.favorites.some((f) => f.buildingId === "test-block-x"), "Analytics groups top favorites in MongoDB");

    // 12. Site Settings Persistence in MongoDB
    const updateSettingsRes = await fetch(`${baseUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        contactEmail: "admin@psit.ac.in",
        contactPhone: "+91 99999 88888",
        instagram: "https://instagram.com/test",
      }),
    });
    assert(updateSettingsRes.status === 200, "Admin updates settings: 200 OK");
    const dbSettings = await SiteSettings.findOne({ key: "main" });
    assert(dbSettings.contactPhone === "+91 99999 88888", "Site settings persisted in MongoDB");

    // 13. Delete Building removes from MongoDB and cascades favorites
    const deleteBRes = await fetch(`${baseUrl}/api/buildings/test-block-x`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteBRes.status === 200, "Admin deletes building: 200 OK");
    const dbBuildingDeleted = await Building.findOne({ id: "test-block-x" });
    assert(!dbBuildingDeleted, "Building removed from MongoDB");
    const cascadedFav = await Favorite.findOne({ buildingId: "test-block-x" });
    assert(!cascadedFav, "Favorites for deleted building cleaned up in MongoDB");

    // Cleanup test users and reports
    await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail, fakeAdminEmail] } });
    await Report.deleteMany({ buildingId: "test-block-x" });

    console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
