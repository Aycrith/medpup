# MedPup Agent Guidelines

This repository contains the complete planning, research, and operational assets for the MedPup pet medical concierge business.

## Repository Structure

- **01_BUSINESS/** — Core strategy, business plan, quick-start guide, gap analysis, tech stack
- **02_PHASES/** — Phase 1-5 execution playbooks (legal, infrastructure, marketing, operations, launch, scaling)
- **03_RESEARCH/** — 23 deep-dive research documents covering market, regulatory, competitive, and operational domains
- **04_ARCHIVE/** — Historical Phase 0 research project (original Florida Animal Aid project)
- **website/** — Hugo static site (Stack theme), 12 content pages. Build with `cd website && hugo --minify`
- **templates/** — Standalone operational templates (client agreement, MOU, referral agreement, onboarding packet, pre-trip checklist, intake schema)
- **workflows/** — n8n automation workflow JSONs (intake-to-CRM, document reminders, post-trip review)
- **emails/** — 8 email templates (6 client sequence + 2 outreach)
- **finance/** — CSV templates (trip ledger, projections, vet tracker, cost comparison)
- **scripts/** — Utility scripts (build, go-bag check, regulatory monitor, trip log generator)
- **operations/** — Trip logs directory (auto-populated by new-trip-log.sh)
- **assets/** — Brand preview images

## Working Conventions

- **No CI/GitHub Actions** — all builds, testing, and automation are local-only
- **No cloud deployment** — everything runs on local infrastructure
- **Website build:** `cd website && hugo --minify` outputs to `website/public/`
- **Website preview:** `cd website && hugo server` at `localhost:1313`
- **Git flow:** Commit to main directly (single operator)

## Key Reference Files

| Need | Look Here |
|------|-----------|
| Business model overview | `01_BUSINESS/BusinessPlanStrategy.md` |
| Next actions to execute | `01_BUSINESS/QuickStartExecutionGuide.md` |
| Legal structure setup | `02_PHASES/Phase1FoundationalBusinessAssets.md` |
| Full market data (JSON) | `KNOWLEDGE_BASE.json` |
| Digital infrastructure | `02_PHASES/Phase2_DigitalInfrastructure.md` |
| Client agreements | `templates/client-service-agreement.md` |
| Automation workflows | `workflows/*.json` |
| Email sequences | `emails/*.md` |
| Financial tracking | `finance/*.csv` |
