import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Meet the Team — Campus Compass" },
      { name: "description", content: "Meet the Campus Compass team behind the smarter campus navigation experience." },
    ],
  }),
  component: TeamPage,
});

const MEMBERS = [
  {
    name: "Ranveer Singh",
    title: "Team Leader & Project Coordinator",
    description: "Coordinates the team, plans project milestones and keeps the Campus Compass work moving forward.",
    img: "/team-images/member-1.png",
    linkedin: "https://www.linkedin.com/in/ranveer-singh-dev45",
  },
  {
    name: "Shaurya Rajput",
    title: "Project Idea, Frontend Development & UI Design",
    description: "Initiated the Campus Compass idea and designs the user experience while building responsive screens for students and campus visitors.",
    img: "/team-images/member-2.png",
    linkedin: "https://www.linkedin.com/in/shaurya-rajput-dev/",
  },
  {
    name: "Sarthak Mishra",
    title: "Backend Development & Database",
    description: "Develops the API and manages the data structure for buildings, users, authentication and search.",
    img: "/team-images/member-3.png",
    linkedin: "https://www.linkedin.com/in/sarthak-mishra-885587321",
  },
  {
    name: "Shanu Ali",
    title: "Research, Testing & Documentation",
    description: "Researches campus requirements, tests key workflows and documents the project for a smooth handover.",
    img: "/team-images/member-4.png",
    linkedin: "https://www.linkedin.com/in/shanu-ali-6706813b9/",
  },
];

function TeamPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const shortestOffset = (index: number, active: number, total: number) => {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const goTo = (index: number) => {
    setActiveIndex((index + MEMBERS.length) % MEMBERS.length);
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % MEMBERS.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") prev();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsPointerDown(true);
    setHasDragged(false);
    pointerStartX.current = event.clientX;
    setDragDeltaX(0);
    if (trackRef.current) {
      trackRef.current.classList.add("is-grabbing");
      trackRef.current.style.transition = "none";
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return;
    const delta = event.clientX - pointerStartX.current;
    setDragDeltaX(delta);
    if (Math.abs(delta) > 6) setHasDragged(true);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${delta * 0.35}px)`;
    }
  };

  const onPointerUp = () => {
    if (!isPointerDown) return;
    setIsPointerDown(false);
    if (trackRef.current) {
      trackRef.current.classList.remove("is-grabbing");
      trackRef.current.style.transition = "";
      trackRef.current.style.transform = "";
    }

    if (Math.abs(dragDeltaX) > 60) {
      dragDeltaX < 0 ? next() : prev();
    }
    setDragDeltaX(0);
  };

  return (
    <div className="team-page">
      <div className="team-page__topbar">
        <Link to="/about" className="team-page__back">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to About</span>
        </Link>
      </div>

      <section className="team-section" id="team">
        <div className="team-page__heading">
          <p className="team-page__eyebrow">Campus Compass / People</p>
          <h1>Meet the Team</h1>
        </div>

        <div className="carousel" id="carousel">
          <button type="button" className="nav-arrow nav-arrow--left" id="prevBtn" aria-label="Previous team member" onClick={prev}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3.5L5 9L11 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          <div
            className="carousel-stage"
            id="stage"
            tabIndex={0}
            aria-label="Team member carousel, use arrow keys to navigate"
            onKeyDown={onKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div ref={trackRef} className="carousel-track" id="track">
              {MEMBERS.map((member, index) => {
                const offset = shortestOffset(index, activeIndex, MEMBERS.length);
                const abs = Math.abs(offset);
                const isActive = offset === 0;
                const x = offset * 220;
                const rotate = offset * -28;
                const scale = 1 - abs * 0.16;
                const gray = Math.min(abs * 70, 100);
                const opacity = abs === 0 ? 1 : Math.max(0.85 - abs * 0.25, 0.25);

                return (
                  <article
                    key={member.name}
                    className="member-card"
                    data-active={isActive ? "true" : "false"}
                    style={{
                      transform: `translateX(${x}px) rotateY(${rotate}deg) scale(${scale})`,
                      filter: `grayscale(${gray}%)`,
                      opacity: String(opacity),
                      zIndex: String(10 - abs),
                      pointerEvents: abs > 3 ? "none" : "auto",
                    }}
                    onClick={() => {
                      if (hasDragged) return;
                      if (!isActive) goTo(index);
                    }}
                  >
                    <div className="member-card__portrait">
                      <img src={member.img} alt={member.name} loading="lazy" draggable={false} />
                    </div>
                    <div className="member-card__scrim" />
                    <div className="member-card__info">
                      <h3 className="member-card__name">{member.name}</h3>
                      <p className="member-card__title">{member.title}</p>
                      <a
                        className="member-card__linkedin"
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Find ${member.name} on LinkedIn`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <FaLinkedinIn aria-hidden="true" />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button type="button" className="nav-arrow nav-arrow--right" id="nextBtn" aria-label="Next team member" onClick={next}>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="carousel-meta">
          <div className="progress-track" id="progressTrack">
            {MEMBERS.map((member, index) => (
              <button
                key={member.name}
                type="button"
                className={`progress-bar ${index === activeIndex ? "is-active" : ""}`}
                aria-label={`Go to member ${index + 1}`}
                onClick={() => goTo(index)}
              >
                <span className="progress-bar__fill" />
              </button>
            ))}
          </div>
          <p className="pagination">
            <span id="pageCurrent">{String(activeIndex + 1).padStart(2, "0")}</span> / <span id="pageTotal">{String(MEMBERS.length).padStart(2, "0")}</span>
          </p>
          <p className="drag-hint">Drag · Scroll · Arrows</p>
          <motion.div
            key={activeIndex}
            className="team-member-description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className="team-member-description__label">About this member</span>
            <strong>{MEMBERS[activeIndex].title}</strong>
            <p>{MEMBERS[activeIndex].description}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
