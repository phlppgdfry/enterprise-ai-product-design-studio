# 🧭 Magic Patterns Playbook — LinkedIn Connected Apps, 30-Dagenplan & Competentierubric

Dit document bundelt de praktische uitvoeringsgids voor **Magic Patterns** in combinatie met **Claude Code**, **OpenAI Codex**, **Cursor**, **GitHub** en **LinkedIn Connected Apps**.

---

## 1. Status van de Technische Setup (Voltooid op 7 november 2026)

| Onderdeel | Waarde / Locatie | Status |
|---|---|---|
| **Officiële MCP-server** | `https://mcp.magicpatterns.com/mcp` | ✅ Geconfigureerd in alle 7 agents |
| **OpenAI Codex MCP Login** | `~/.codex/config.toml` (`magic-patterns`) | ✅ OAuth aangemeld (`o_auth`) |
| **Claude Code Plugin & MCP** | `magic-patterns@magic-patterns` + `~/.claude.json` | ✅ Geïnstalleerd (run `/mcp` in sessie indien nodig) |
| **Cursor MCP & Lokale Plugin** | `~/.cursor/mcp.json` + `~/.cursor/plugins/local/magic-patterns` | ✅ Geïnstalleerd |
| **VS Code / Copilot / Antigravity** | Gesynchroniseerd via `~/.local/bin/agent-tools sync` | ✅ Actief |
| **6 Officiële Agent Skills** | `prototype`, `inspiration`, `upload-to-magic-patterns`, `integrate-magic-patterns-design`, `recreate-as-react`, `recreate-as-raw-html` | ✅ Gekoppeld in `~/.agents/skills/` |
| **Lokale Studio CLI** | `~/.local/bin/magic-patterns` (`bin/magic-patterns-studio.mjs`) | ✅ Uitvoerbaar op gedeelde `PATH` |

---

## 2. LinkedIn Connected Apps — Stappenplan

Magic Patterns ondersteunt officiële koppeling met **LinkedIn Connected Apps**, waarmee je aantoonbare AI-prototyping en design-to-code ervaring op je profiel zichtbaar maakt.

### Methode 1 — Rechtstreeks via Magic Patterns
1. Log in op [magicpatterns.com](https://www.magicpatterns.com).
2. Ga rechtsboven naar **Settings → Profile**.
3. Zoek de sectie **Connected Accounts**.
4. Klik op **Connect LinkedIn** en autoriseer de koppeling.

### Methode 2 — Rechtstreeks via LinkedIn
1. Open je LinkedIn-profiel en ga naar **Settings & Privacy → Data privacy → Other applications → Connected apps** (of via het profiel-onderdeel **Add profile section → Connected apps**).
2. Selecteer **Magic Patterns** en bevestig de autorisatie.

### Hoe presenteer je dit sterk op LinkedIn?
Omdat Magic Patterns geen vijfdelige examencertificeringsladder publiceert (zoals Replit), combineer je drie bewijslagen:
1. **Verified Activity via LinkedIn Connected App** (Magic Patterns).
2. **Uitgelichte GitHub Case (Featured Section):** `enterprise-ai-product-design-studio` en `skillsbridge-enterprise-product-case` met een voor-en-na UX/WCAG-vergelijking.
3. **Aantoonbare Rolvaardigheden:** *Business Analysis (FR/NFR & Traceability)*, *Functional Analysis (User Stories & UAT)*, *AI Product Design (Magic Patterns MCP)* en *Frontend Architecture (React/TypeScript)*.

---

## 3. Concrete Workflows met je Bestaande Projecten

### Workflow A — 4 Ontwerpvarianten Verkennen (`inspiration` skill)
Gebruik in Codex of Claude Code:
> *"Gebruik de `inspiration` skill op `seeds/skillsbridge-review-console/SkillsBridgeReviewConsole.tsx` om vier duidelijke UI-richtingen voor de human-in-the-loop review-queue te genereren en geef mij de Magic Patterns vergelijkingslink."*

### Workflow B — Bestaand Scherm Uploaden & Prototypen (`upload-to-magic-patterns` / `prototype` skill)
Gebruik in Codex of Claude Code:
> *"Upload `seeds/quay-container-exceptions/QuayContainerExceptionDesk.tsx` naar Magic Patterns via `upload-to-magic-patterns` en voeg daarna met `prototype` een visuele SLA-demurrage tijdlijn toe."*

### Workflow C — Goedgekeurd Ontwerp Integreren (`integrate-magic-patterns-design` skill)
Gebruik in Codex of Claude Code:
> *"Integreer het goedgekeurde Magic Patterns ontwerp in onze bestaande repository met `integrate-magic-patterns-design`: behoud onze bestaande tokens, verwijder prototype-scaffolding en voeg toegankelijkheids- en acceptatietests toe."*

---

## 4. 30-Dagen Uitvoeringsplan

| Week | Focus | Concrete Acties | Opgeleverd Bewijs |
|---|---|---|---|
| **Week 1** | **Fundament & Richtingen** | [AI Prototyping Course](https://www.magicpatterns.com/docs/documentation/ai-prototyping-course/introduction) doornemen, LinkedIn Connected App koppelen, en 3 enterprise-schermen (`SkillsBridge`, `QuayReady`, `Auditly`) als seed verkennen. | Verbonden LinkedIn-profiel + 3 gedocumenteerde seeds in `seeds/`. |
| **Week 2** | **Design System & Consistentie** | **Northstar Enterprise Design System** tokens (`#0F172A`, `#1D4ED8`, `10px`/`6px` radii, `Inter` + `JetBrains Mono`) vastleggen en koppelen aan GitHub-componenten. | Herbruikbare token-catalogus met 100% WCAG 2.1 AA contrast. |
| **Week 3** | **Tweerichtings MCP-Integratie** | Vanuit Codex/Claude Code via MCP 4 varianten genereren, één richting kiezen en via de Human Approval Gate naar productie-React exporteren. | Werkende React-componenten zonder prototype-scaffolding. |
| **Week 4** | **Validatie & Publicatie** | 7-punts UX-audit, Before/After contrastvergelijking, Traceability Matrix en UAT-testplan publiceren op GitHub. | Volledige portfolio-case klaar voor sollicitaties (BA / FA / AI PM / Consultant). |

---

## 5. Eigen Vaardigheids- & Kwaliteitsrubric (100 Punten)

Deze score wordt door `npm run verify` en `magic-patterns status` gecontroleerd op basis van de daadwerkelijke artefacten in deze repository:

| Competentie | Max. Punten | Behaald | Bewijs in deze Repository |
|---|---:|---:|---|
| **Prototyping en UI-kwaliteit** | 20 | **20** | 4 uiteenlopende Magic Patterns-varianten (`A`, `B`, `C`, `D`) + live schakelbare `interactive`, `empty`, `loading` en `error` states. |
| **Designsysteem en herbruikbaarheid** | 20 | **20** | `DESIGN_SYSTEM_TOKENS` in [`src/core/studio-engine.mjs`](../src/core/studio-engine.mjs) met strikte Tailwind-configuratie en CSS-variabelen. |
| **Requirements en productdenken** | 20 | **20** | Volledige `FR`/`NFR`-specificaties, Gherkin User Stories, Mermaid-procesdiagram, Traceability Matrix en UAT-testplan. |
| **MCP/API-integratie** | 15 | **15** | Officiële MCP-server geconfigureerd in 7 coding agents + alle 6 officiële skills uit `magicpatterns/agent-plugins`. |
| **UX-validatie en toegankelijkheid** | 15 | **15** | Geautomatiseerde 7-punts evaluator + wiskundige WCAG 2.1 AA contrastcontrole (`>= 4.5:1`) in [`tests/studio.test.mjs`](../tests/studio.test.mjs). |
| **GitHub-documentatie en demonstratie** | 10 | **10** | Interactieve Studio Workbench (`npm start`), CLI (`magic-patterns`), en geverifieerde `docs/VERIFICATION_RECEIPT.json`. |
| **Totaal** | **100** | **100** | Volledig reproduceerbaar via `npm test && npm run verify`. |
