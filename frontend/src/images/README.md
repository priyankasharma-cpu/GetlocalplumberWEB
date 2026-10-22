# Replacing images

Each of the 24 service folders accepts `main.webp`, `detail-1.webp`, and `detail-2.webp`. The service configuration uses Vite's eager `import.meta.glob` to map actual files. Missing files show a clearly labeled temporary illustration; no missing asset URL is requested. Add the files and restart Vite/build to include them.

The hero `hero/plumber.webp` is an AI-generated illustrative image, not a real employee or provider. It was generated with the built-in imagegen tool using this prompt: "Premium natural editorial photograph of a professional adult plumber wearing a navy work shirt, kneeling next to an open under-sink cabinet in a bright modern American home kitchen, examining pipe connections with a wrench. Soft daylight, muted teal and blue palette, vertical framing. No text, logos, badges, or watermarks. Illustrative stock-style imagery, not an actual employee."

Replace temporary assets with owned or licensed service-specific photographs before launch. Optimize to WebP/AVIF, keep aspect ratios suitable for object-fit cover, and update image alt descriptions when replacing illustrative images with actual photos.

Six additional generated plumbing scenes populate all 72 service image paths. Exact prompts and representative output paths are in `generated-assets.json`. These images are illustrative, not documented employees or completed projects.
