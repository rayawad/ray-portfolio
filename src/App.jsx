import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =======================
   CURSOR SYSTEM
======================= */
function useFancyCursor(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const glow = root.querySelector(".cursorGlow");
    const ring = root.querySelector(".cursorRing");
    const dot = root.querySelector(".cursorDot");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const setHoverState = (isHover) => {
      root.classList.toggle("cursorHover", isHover);
    };

    const setDownState = (isDown) => {
      root.classList.toggle("cursorDown", isDown);
    };

    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      gsap.to(dot, { x, y, duration: 0.06, ease: "power3.out" });
      gsap.to(ring, { x, y, duration: 0.14, ease: "power3.out" });
      gsap.to(glow, { x, y, duration: 0.22, ease: "power3.out" });
    };

    const enter = () => gsap.to([glow, ring, dot], { autoAlpha: 1, duration: 0.15 });
    const leave = () => gsap.to([glow, ring, dot], { autoAlpha: 0, duration: 0.15 });

    const down = () => setDownState(true);
    const up = () => setDownState(false);

    // Hover detection on interactive elements
    const onOver = (e) => {
      const t = e.target;
      const interactive = t.closest("a, button, [data-cursor='hover'], [data-magnetic='true']");
      setHoverState(Boolean(interactive));
    };
    const onOut = () => setHoverState(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseenter", enter);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    gsap.set([glow, ring, dot], { autoAlpha: 0 });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseenter", enter);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, [rootRef]);
}

/* =======================
   MAGNETIC ELEMENTS
======================= */
function useMagnetic(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const strength = 0.32;
    const targets = Array.from(root.querySelectorAll("[data-magnetic='true']"));

    const handlers = [];

    targets.forEach((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.18, ease: "power3.out" });
      };

      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" });
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);

      handlers.push({ el, onMove, onLeave });
    });

    return () => {
      handlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [rootRef]);
}

/* =======================
   SCROLL REVEAL
======================= */
function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const items = gsap.utils.toArray(root.querySelectorAll(".reveal"));

    items.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [rootRef]);
}

/* =======================
   3D ORB
======================= */
function Orb() {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 55 }} className="orbCanvas">
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 2, 2]} intensity={1.25} />
      <Float speed={1.6} rotationIntensity={1.05} floatIntensity={1.1}>
        <Sphere args={[1, 96, 96]}>
          <MeshDistortMaterial distort={0.4} speed={1.55} roughness={0.2} />
        </Sphere>
      </Float>
    </Canvas>
  );
}

export default function App() {
  useEffect(() => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
    });
  });
}, []);
  const rootRef = useRef(null);

  useFancyCursor(rootRef);
  useMagnetic(rootRef);
  useScrollReveal(rootRef);

  useEffect(() => {
    gsap.fromTo(
      ".heroIn",
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08 }
    );
  }, []);

  return (
    <div ref={rootRef} className="pageRoot">
      {/* Custom Cursor */}
      <div className="cursorGlow" aria-hidden="true" />
      <div className="cursorRing" aria-hidden="true" />
      <div className="cursorDot" aria-hidden="true" />

      <header className="nav">
        <div className="navInner">
          <a className="brand" href="#top" data-magnetic="true" data-cursor="hover">
            <span className="brandDot" />
            <span>Ray Awad</span>
          </a>

          <nav className="navLinks">
            <a href="#about" data-cursor="hover">
              About
            </a>
            <a href="#wins" data-cursor="hover">
              Wins
            </a>
            <a href="#contact" className="navCta" data-magnetic="true" data-cursor="hover">
              Let’s talk
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="hero">
        <div className="heroGrid">
          <div className="heroCopy">
            <div className="badge heroIn reveal">Customer Success Manager • BC, Canada</div>

            <h1 className="heroIn reveal">
  Customer Success
  <br />
  <span className="accent">Built for Scale.</span>
</h1>

<p className="heroIn reveal">
  Customer Success professional focused on building scalable onboarding systems 
  and optimizing product adoption across SMB portfolios. Skilled in leveraging 
  CRM tools, account health metrics, and behavioral data to improve time-to-value 
  and increase lifetime customer retention.
</p>


            <div className="actions heroIn reveal">
              <a className="btn primary" href="#contact" data-magnetic="true" data-cursor="hover">
                Book a chat
              </a>
              <a className="btn ghost" href="#about" data-magnetic="true" data-cursor="hover">
                See my approach
              </a>
            </div>

            <div className="mini heroIn reveal">
              <div className="miniCard">
                <div className="miniLabel">Focus</div>
                <div className="miniValue">Onboarding → Adoption → Retention</div>
              </div>
              <div className="miniCard">
                <div className="miniLabel">Style</div>
                <div className="miniValue">Custom Cursor + Magnetic UI</div>
              </div>
            </div>
          </div>

          <div className="heroVisual reveal" aria-hidden="true">
            <div className="orbWrap">
              <Orb />
              <div className="orbGlow" />
            </div>
            <div className="frame" />
          </div>
        </div>
      </main>

      <section id="about" className="section reveal">
        <div className="sectionHead">
          <div className="kicker">Overview</div>
          <h2>High-touch, measurable, calm</h2>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>What I do</h3>
            <p className="muted">
              Structured onboarding, success plans tied to outcomes, adoption coaching, and proactive intervention before churn happens.
            </p>
            <div className="pillRow">
              <span className="pill">Onboarding</span>
              <span className="pill">Health checks</span>
              <span className="pill">Churn prevention</span>
              <span className="pill">Adoption</span>
            </div>
          </div>

          <div className="card">
            <h3>How I work</h3>
            <ul className="list">
              <li>Outcome-first: goal → milestone → next action</li>
              <li>Leading indicators: engagement + completion</li>
              <li>Cross-functional: Sales, Ops, Product</li>
              <li>Simple, consistent, repeatable systems</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="wins" className="section reveal">
        <div className="sectionHead">
          <div className="kicker">Impact</div>
          <h2>Wins I’m proud of</h2>
        </div>

        <div className="grid3">
          <div className="card">
            <h3>200+ customers</h3>
            <p className="muted">Owning the full lifecycle: onboarding → adoption → retention.</p>
          </div>
          <div className="card">
            <h3>Weekly 1:1s</h3>
            <p className="muted">Strategy sessions that drive progress and program completion.</p>
          </div>
          <div className="card">
            <h3>Operational calm</h3>
            <p className="muted">Years resolving live issues while protecting the experience.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="section reveal">
        <div className="sectionHead">
          <div className="kicker">Contact</div>
          <h2>Let’s talk</h2>
        </div>

        <div className="card contact">
          <div>
            <h3>Reach me</h3>
            <p className="muted">Email is best. Add LinkedIn/Calendly anytime.</p>
          </div>

          <div className="contactActions">
            <a className="btn primary" href="mailto:ray-awad10@hotmail.com" data-magnetic="true" data-cursor="hover">
              Email me
            </a>
            <a className="btn ghost" href="#top" data-magnetic="true" data-cursor="hover">
              Back to top
            </a>
          </div>
        </div>

        <footer className="footer muted">© {new Date().getFullYear()} Ray</footer>
      </section>
    </div>
  );
}