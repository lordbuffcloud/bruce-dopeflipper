# DopeFlipper for Bruce

CK42X DopeWars port for **LilyGO T-Embed / T-Embed CC1101** running [Bruce](https://github.com/BruceDevices/firmware) firmware.

Buy low, sell high, dodge cops, and survive 30 days across NYC boroughs. Stats export to `/ck42x_dopewars/stats.ck42x` for the shared [ck42x.com/dopeflipper](https://www.ck42x.com/dopeflipper) leaderboard (manual profile import; device name **TEmbed**).

## Install

**Bruce App Store:** Search **DopeFlipper** under Games and install.

**Manual:** Copy `dopeflipper.js` to your device scripts folder and run from BruceJS.

## Controls (T-Embed)

| Input | Action |
|-------|--------|
| Encoder rotate | Move selection (PREV / NEXT) |
| Encoder press | Confirm (SEL) |
| Side button | Back / cancel (ESC) |

Enable **Settings → Sound** for audio feedback.

## Leaderboard

After playing, export stats from Bruce WebUI or serial:

```text
storage read /ck42x_dopewars/stats.ck42x
```

Paste the full profile at [ck42x.com/dopeflipper](https://www.ck42x.com/dopeflipper) → Manual profile import. Use device name **TEmbed** when decoding.

## Related

- Flipper Zero app: [flipper-ck42x-dopeflipper](https://github.com/lordbuffcloud/flipper-ck42x-dopeflipper)
- CK42X: [ck42x.com](https://www.ck42x.com)

## License

MIT — see [LICENSE](LICENSE).
