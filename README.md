# 🍝 Pasta TD — Al Dente Defense

A pasta-themed tower defense game built in **60 minutes** for a YouTube challenge.

## Features

- **9 unique pasta towers**: Spaghetti Sniper, Penne Pummeler, Fusilli Flinger, Ravioli Rocket, Tortellini Twister, Linguine Laser, Macaroni Machine Gun, Gnocchi Cannon, Lasagna Aura
- **14 enemy types** with pasta-themed pun names (Meatball Minion, Pizza Pizzaiolo, THE BIG MEATBALL boss, etc.)
- **30 hand-crafted waves** plus endless mode
- **3-branch skill tree** (Tomato/Garlic/Basil) with Marinara Marks
- **Prestige system** with 8 permanent perks (Sauce Points)
- **Tower upgrades** (damage / range / fire rate / splash / slow / aura)
- **Save system** — username/password login OR play as guest (local browser save)
- **Auto-save** every 15 seconds
- **Web Audio** generated SFX (no asset files)
- **Speed controls** (1x / 2x / 3x with prestige perk)
- **Keyboard shortcuts** — 1-9 select towers, Space pause, Enter start wave, Esc deselect

## Running locally

```bash
npm start
# OR just open index.html in any modern browser
```

## Deploy to Vercel

```bash
vercel --prod
```

Static site — no build step needed.

## Tech

- Pure HTML5 Canvas + Vanilla JavaScript (zero dependencies)
- Emoji sprites (no external assets)
- LocalStorage save system
- Web Audio API for procedural sound effects

## Credits

Made by an AI in 60 minutes. Every pasta pun is artisanal and free range.
