//#region node_modules/.nitro/vite/services/ssr/assets/favorites-D3aR_5-0.js
var KEY = "cc_favorites";
var ALIAS_KEY = "cc_favorite_aliases";
function getFavorites() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) || "[]");
	} catch {
		return [];
	}
}
function saveFavorites(list) {
	try {
		localStorage.setItem(KEY, JSON.stringify(list));
	} catch {}
}
function toggleFavorite(id) {
	const list = getFavorites();
	const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
	saveFavorites(next);
	if (!next.includes(id)) {
		const aliases = getFavoriteAliases();
		if (aliases[id]) {
			delete aliases[id];
			saveAliases(aliases);
		}
	}
	return next;
}
function removeFavorite(id) {
	const next = getFavorites().filter((x) => x !== id);
	saveFavorites(next);
	const aliases = getFavoriteAliases();
	if (aliases[id]) {
		delete aliases[id];
		saveAliases(aliases);
	}
	return next;
}
function getFavoriteAliases() {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(localStorage.getItem(ALIAS_KEY) || "{}");
	} catch {
		return {};
	}
}
function saveAliases(a) {
	try {
		localStorage.setItem(ALIAS_KEY, JSON.stringify(a));
	} catch {}
}
function setFavoriteAlias(id, alias) {
	const a = getFavoriteAliases();
	const trimmed = alias.trim();
	if (trimmed) a[id] = trimmed;
	else delete a[id];
	saveAliases(a);
	return a;
}
var RECENT = "cc_recent";
function pushRecent(id) {
	if (typeof window === "undefined") return;
	const next = [id, ...JSON.parse(localStorage.getItem(RECENT) || "[]").filter((x) => x !== id)].slice(0, 8);
	localStorage.setItem(RECENT, JSON.stringify(next));
}
function getRecent() {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(RECENT) || "[]");
	} catch {
		return [];
	}
}
function moveFavoriteTo(id, index) {
	const list = getFavorites();
	const i = list.indexOf(id);
	if (i < 0) return list;
	const target = Math.max(0, Math.min(list.length - 1, index));
	if (target === i) return list;
	const next = list.slice();
	next.splice(i, 1);
	next.splice(target, 0, id);
	saveFavorites(next);
	return next;
}
function addFavorites(ids) {
	const list = getFavorites();
	const next = [...list, ...ids.filter((id) => !list.includes(id))];
	saveFavorites(next);
	return next;
}
//#endregion
export { moveFavoriteTo as a, setFavoriteAlias as c, getRecent as i, toggleFavorite as l, getFavoriteAliases as n, pushRecent as o, getFavorites as r, removeFavorite as s, addFavorites as t };
