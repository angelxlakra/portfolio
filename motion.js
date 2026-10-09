// Shared motion helpers for the version pages. Each page still decides what
// moves; this only holds the pieces they all use.
//   MOTION.still        true when the visitor asked for reduced motion
//   MOTION.EASE         the strong ease-out used across the site
//   MOTION.reveal(sel)  fade matching elements up as they scroll into view,
//                       staggering ones that arrive together
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const css = document.createElement("style");
  css.textContent = `.rv{opacity:0}.rv.in{opacity:1;transition:opacity .6s ease var(--d,0ms)}
@media (prefers-reduced-motion:no-preference){.rv{translate:0 18px}.rv.in{translate:0 0;transition:opacity .6s ease var(--d,0ms),translate .8s ${EASE} var(--d,0ms)}}
.lib-back{transition:background-color .2s ease,transform .16s ease-out}.lib-back:active{transform:scale(.97)}`;
  document.head.append(css);
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            let i = 0;
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              const el = e.target,
                d = Math.min(i++, 8) * 70;
              el.style.setProperty("--d", d + "ms");
              el.classList.add("in");
              io.unobserve(el);
              // hand the element back its own transitions once it has landed
              setTimeout(() => el.classList.remove("rv", "in"), d + 900);
            }
          },
          { rootMargin: "0px 0px -6% 0px" },
        )
      : null;
  globalThis.MOTION = {
    still,
    EASE,
    reveal(sel, root = document) {
      if (io)
        root.querySelectorAll(sel).forEach((el) => {
          el.classList.add("rv");
          io.observe(el);
        });
    },
  };
})();
