// MotionConfig in App respects the visitor's reduced-motion preference.
// Shared card entrance and hover settings; GSAP section cleanup stays in Home.
export const serviceCardMotion = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  whileHover: { y: -5 },
};
