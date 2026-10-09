# Temporary Placeholder Assets

The following character assets located in `src/assets/hero-characters/` are **TEMPORARY** placeholders created for the Hero multiverse visual stage. They will be replaced with finalized event character illustrations:

| Filename | Character / Theme | Status | Intended Accent |
| :--- | :--- | :--- | :--- |
| `349382-1125x2436-iphone-hd-black-widow-background-photo-removebg-preview.png` | Black Widow (Master Spy / Espionage) | TEMPORARY | `#E11D48` (Widow Crimson) |
| `8U4Anpj-removebg-preview.png` | Hulk (Gamma Rage - Cinematic) | TEMPORARY | `#10B981` (Gamma Green) |
| `HD-wallpaper-thor-removebg-preview.png` | Thor (God of Thunder - Cinematic) | TEMPORARY | `#38BDF8` (Lightning Blue) |
| `image-removebg-preview.png` | Spider-Man (Web Slinger with Shield) | TEMPORARY | `#EF4444` (Crimson Red) |
| `wp7494946-removebg-preview.png` | Hawkeye (Master Marksman) | TEMPORARY | `#A855F7` (Hawkeye Violet) |

## Track Champion Art Assets

| File | Character / Track | Status | Intended Accent |
| :--- | :--- | :--- | :--- |
| `public/characters/policy.png` (or `.webp`) | Daredevil (Policy-thon) | TEMPORARY | `#eab308` (Gold) |
| `public/characters/open.png` (or `.webp`) | Spider-Man (Open) | TEMPORARY | `#14b8a6` (Teal) |

> **Note**: Official track champion art assets for AI/ML (Iron Man), Cybersecurity (Captain America), and Web3 (Black Panther) reside in `/public/characters/`. Temporary assets for Policy-thon and Open are also in `/public/characters/`.

## Hero Crowd Wall Background

| File | Status | Notes |
| :--- | :--- | :--- |
| `src/assets/hero-wall/20356117-removebg-preview.png` | **TEMPORARY** — Replace before public launch | Source crowd PNG (632×395px, upscaled). Baked into 4 WebP layers in `public/hero/` by `scripts/prepare-hero-wall.mjs`. Replace with a high-res (≥ 1600px wide) crowd or team image; re-run `npm run prepare:hero` after replacing. |

> **Warning**: Source is only 632px wide — a ≥ 1600px original will produce significantly sharper results.
