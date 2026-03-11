[![SentinelOne Userscript](https://img.shields.io/badge/Also%20available-SentinelOne%20PowerQuery%20Userscript-6C2EB9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDIgMTJsMTAgMTAgMTAtMTBMMTIgMnoiLz48L3N2Zz4=)](https://github.com/LasCC/SentinelOne-Userscript)

# Microsoft Sentinel & Defender: Threat Hunting Queries

Tampermonkey userscript that adds a threat hunting query menu to **Microsoft Sentinel** and **Microsoft Defender** Advanced Hunting pages.

Browse, search, pin, and inject KQL queries directly into the Monaco editor.

## Screenshots

| Defender (dark mode) | Sentinel | Sentinel (popup) |
|---|---|---|
| ![Defender](docs/defender-dark.png) | ![Sentinel](docs/sentinel-button.png) | ![Popup](docs/sentinel-popup.png) |

## Features

- Inline "Threat Hunting Queries" button in the command bar
- Tabs: **User Rules** (bundled), **Reprise99**, **Bert-JanP**, **FalconFriday** (fetched from GitHub)
- Category filter chips for quick sub-filtering within each repo tab
- Search across query name, description, category, and KQL content
- Pin queries for quick access (horizontal pill bar above results)
- Click any query row to inject it into the editor
- Works in both Sentinel (reactblade iframe) and Defender (security.microsoft.com)
- Light/dark theme support via Azure Portal CSS variables

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Click **[Install Userscript](https://raw.githubusercontent.com/LasCC/MicrosoftSentinel-Userscript/main/dist/sentinel-userscript.user.js)** (auto-installs in Tampermonkey)
3. Navigate to Advanced Hunting in Sentinel or Defender

## Public Rule Sources

| Repo | Queries | Format |
|------|---------|--------|
| [reprise99/Sentinel-Queries](https://github.com/reprise99/Sentinel-Queries) | ~460 | `.kql` files |
| [Bert-JanP/Hunting-Queries-Detection-Rules](https://github.com/Bert-JanP/Hunting-Queries-Detection-Rules) | ~445 | `.md` with fenced KQL |
| [FalconForceTeam/FalconFriday](https://github.com/FalconForceTeam/FalconFriday) | ~40 | `.md` with fenced KQL |

Rules are fetched lazily on first tab click, cached locally for 12 hours.

## Build

```
npm install
npm run build
```

Output: `dist/sentinel-userscript.user.js`

## Related

- [SentinelOne Userscript](https://github.com/LasCC/SentinelOne-Userscript) - Similar project for SentinelOne
