# DopeFlipper for Bruce

CK42X DopeWars port for **LilyGO T-Embed / T-Embed CC1101** running [Bruce](https://github.com/BruceDevices/firmware) firmware.

Buy low, sell high, dodge cops, and survive 30 days across NYC boroughs. Finished runs export a signed profile to `/ck42x_dopewars/stats.ck42x` for the shared [ck42x.com/dopeflipper](https://www.ck42x.com/dopeflipper) leaderboard (manual profile import; device name **TEmbed**).

![DopeFlipper logo](logo.png)

## Requirements

- Bruce firmware on a **T-Embed** or **T-Embed CC1101**
- Rotary encoder + side button (see controls below)
- **Settings → Sound** enabled for in-game audio cues

## Install

**Bruce App Store (recommended):** Open **Config → Install App Store**, connect to Wi‑Fi, browse **Games**, search **DopeFlipper**, and install.

**Manual:** Copy `dopeflipper.js` into your BruceJS scripts folder and run it from the JS interpreter.

## Controls (T-Embed)

| Input | Action |
|-------|--------|
| Encoder rotate | Move selection (PREV / NEXT) |
| Encoder press | Confirm (SEL) |
| Side button | Back / cancel (ESC) |

On the title screen, **NEXT** toggles in-game sound; **PREV** opens all-time stats.

## Gameplay

- Start with **$2,000** cash, **$5,500** debt, **30** days, and **100** coat slots.
- Hub actions: **BUY**, **SELL**, **PRICES**, **TRAVEL**, **BANK**, **STATUS**, **NEW RUN**.
- Eight products across ten boroughs; prices shift with travel, market events, and location bias.
- **Bank** cash to protect it from street events; repay the loan shark before time runs out.
- **Heat** rises on big deals and cop encounters; travel and running from cops cool it down.
- Cop stops offer **fight** (encoder minigame) or **run** (lane dodge); outcomes affect cash, inventory, and heat.
- Runs **autosave** to LittleFS after trades, travel, bank actions, and cop outcomes.
- **STATUS** shows net worth, rank, heat, coat usage, and the path to your profile file.

## Device storage

| Path | Purpose |
|------|---------|
| `/ck42x_dopewars/save.json` | In-progress run |
| `/ck42x_dopewars/stats.json` | All-time local stats |
| `/ck42x_dopewars/stats.ck42x` | Encoded profile for ck42x.com |

## Leaderboard

After a finished run (or from Bruce WebUI / serial):

```text
storage read /ck42x_dopewars/stats.ck42x
```

Paste the full profile at [ck42x.com/dopeflipper](https://www.ck42x.com/dopeflipper) → **Manual profile import**. Use device name **TEmbed** when decoding.

Score codes and profile seals are integrity checks for the bridge, not cheat-proof online proof.

## App Store metadata

This repo includes [`metadata.json`](metadata.json) and [`logo.png`](logo.png) for [Bruce App Store publishing](https://github.com/BruceDevices/App-Store-Data/blob/main/README.md). Bump `version` and `commit` in `metadata.json` whenever you tag a release.

## Related

- Flipper Zero app: [flipper-ck42x-dopeflipper](https://github.com/lordbuffcloud/flipper-ck42x-dopeflipper)
- CK42X: [ck42x.com](https://www.ck42x.com)

## License

MIT — see [LICENSE](LICENSE).
