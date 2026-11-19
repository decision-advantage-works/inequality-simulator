# Inequality Simulator

## What This Is

An agent-based economic simulation that models wealth inequality under different government/economic policies (econophysics, fascism, communism, capitalism). It has a Flask REST API backend, a vanilla HTML/CSS/JS frontend with Three.js 3D visualization, Gemini-powered AI policy generation, and a Blockly visual programming editor. The app is educational — helping users explore how policies affect wealth distribution, economic mobility, and the Gini coefficient.

## Core Value

The simulation must run in the browser with real-time 3D visualization of economic agents and allow users to explore different policy outcomes — accessible to anyone via a public URL.

## Requirements

### Validated

- ✓ Mesa 3.0 agent-based simulation with 5 policy types — existing
- ✓ Flask REST API with full simulation control endpoints — existing
- ✓ Three.js 3D character visualization with crowd system — existing
- ✓ AI policy generation via Google Gemini with code validation — existing
- ✓ Blockly visual programming editor for custom policies — existing
- ✓ Hot-reload system for live code injection — existing
- ✓ Comparison mode running all policies simultaneously — existing
- ✓ Dockerfile and docker-compose.yml for containerization — existing

### Active

- [ ] AWS EC2 instance provisioned and configured
- [ ] GitHub Actions CI/CD pipeline for auto-deploy on push
- [ ] Nginx reverse proxy for production serving
- [ ] Health check endpoint for monitoring
- [ ] Environment variable management for production secrets
- [ ] App accessible via EC2 public IP

### Out of Scope

- Custom domain / DNS setup — will add later
- SSL/HTTPS — requires domain first
- Auto-scaling / load balancing — single instance sufficient for educational tool
- Database / persistent storage — simulation is stateless
- User authentication — public educational tool

## Context

- The app is already containerized (Dockerfile with gunicorn, docker-compose.yml)
- EC2-SETUP.md exists with manual setup instructions for Amazon Linux 2023
- Currently on `deploy/docker-aws` branch
- GitHub repo: `decision-advantage-works/inequality-simulator`
- GOOGLE_API_KEY env var needed for Gemini AI features
- Port 5001 used by the container
- No AWS account exists yet — needs to be created
- No GitHub Actions workflows exist yet

## Constraints

- **Cloud Provider**: AWS EC2 — chosen platform
- **Budget**: Minimal — single t2.micro or t3.micro instance (free tier eligible)
- **Secrets**: GOOGLE_API_KEY must not be committed; passed via .env or GitHub secrets
- **Port**: Container runs on 5001, Nginx proxies from 80

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Docker + EC2 deploy pattern | Simple, repeatable, team already familiar | — Pending |
| GitHub Actions for CI/CD | Auto-deploy on push, standard tooling | — Pending |
| Nginx reverse proxy | Production-grade HTTP serving, easy to add SSL later | — Pending |
| IP-only access initially | No domain yet, simplifies initial deploy | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-23 after initialization*
