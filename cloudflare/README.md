# Smart Security Gateway (Research Prototype)

This is a lightweight, research-focused reverse proxy that performs behavior-based,
ML-assisted security decisions before traffic reaches the upstream web server.

## Features
- Reverse proxy with upstream IP hiding
- Behavior collection (mouse, click, keystrokes)
- Multi-dimensional behavioral fingerprinting
- Navigation flow signals (page paths, dwell time)
- AI decision engine (Isolation Forest + Random Forest)
- Optional semi-supervised classifier (Self-Training + Logistic Regression)
- Invisible challenge (no image CAPTCHA)
- Content-aware invisible challenge
- Admin dashboard with real-time stats
- Automatic behavior script injection for HTML upstreams
- Under-attack mode (JS challenge)
- Basic WAF patterns (SQLi/XSS)
- WAF rule engine with dashboard controls
- Bot score headers for upstream apps
- Honeypot trap endpoint for attacker detection
- Geo/IP reputation policies
- Bot management thresholds

## Quick Start
1) Create a virtual environment and install requirements:
   `python -m venv .venv`
   `.venv\\Scripts\\activate`
   `pip install -r requirements.txt`

2) Train demo models:
   `python ml/train.py`

3) Generate a synthetic dataset for evaluation:
   `python ml/generate_dataset.py`

4) Run evaluation and save results:
   `python ml/evaluate.py`

5) Generate the evaluation report:
   `python ml/report.py`

6) Start an example upstream server (port 8080):
   `uvicorn examples.upstream:app --port 8080`

7) Start the security gateway (port 8000):
   `set UPSTREAM_BASE_URL=http://localhost:8080`
   `uvicorn app.main:app --reload --port 8000`

8) Visit:
   - Protected app: `http://localhost:8000/`
   - Dashboard: `http://localhost:8000/admin`
   - Experiment report: `http://localhost:8000/admin/experiments`

## Traffic Simulation
Run simple request simulations (no abusive load):
- Human-like: `python scripts/traffic_sim.py --scenario human`
- Bot-like: `python scripts/traffic_sim.py --scenario bot`
- Recon: `python scripts/traffic_sim.py --scenario recon`
- Brute force: `python scripts/traffic_sim.py --scenario bruteforce`

## Browser Behavior Simulation
Generate JS-like behavior events without a real browser:
`python scripts/behavior_sim.py --seconds 30`

## Integrating With Your App
The gateway injects the behavior script into HTML responses automatically. If you want
explicit control, you can still add:
`<script src="/static/behavior.js"></script>`

All traffic should flow to the gateway, not directly to the upstream.

## Configuration
Environment variables:
- `UPSTREAM_BASE_URL` (default: http://localhost:8080)
- `SESSION_COOKIE_NAME` (default: sgw_session)
- `CHALLENGE_SECRET` (default: change-me)
- `CHALLENGE_TTL_SECONDS` (default: 120)
- `MAX_REQ_PER_MINUTE` (default: 120)
- `MAX_REQ_PER_MINUTE_IP` (default: 300)
- `UNDER_ATTACK_MODE` (default: 0)
- `ALLOWLIST_IPS` (comma-separated)
- `BLOCKLIST_IPS` (comma-separated)
- `BLOCK_TTL_SECONDS` (default: 300)
- `GATEWAY_IPS` (comma-separated IPs used for DNS origin checks)
- `DDOS_GLOBAL_RPM` (default: 3000)
- `DDOS_IP_RPM` (default: 600)
- `DDOS_SPIKE_MULTIPLIER` (default: 2.5)
- `MODEL_DIR` (default: models)
- `DATA_DB_PATH` (default: data/behavior.db)

## Domain Verification
Visit `http://localhost:8000/admin/domains`, register a domain, and add the TXT record:
`sgw-verify=<token>` on the domain root or `_sgw.<domain>`. Then click Verify.

If `GATEWAY_IPS` is set, the system also checks whether the domain A/AAAA records
match the gateway IPs.

## Scanner Reports
Suspicious scanner user-agents (nmap, masscan, nikto) are logged and visible at:
`http://localhost:8000/admin/reports`

## WAF/Bot/Geo Controls
- WAF rules: `http://localhost:8000/admin/waf`
- Bot thresholds: `http://localhost:8000/admin/bot`
- Geo/IP reputation: `http://localhost:8000/admin/geo`

## Hourly PDF Reports
Access the latest hourly PDF at:
`http://localhost:8000/reports/hourly.pdf`
