# Inequality Simulator

An agent-based economic simulation of how policy shapes wealth inequality. It is based on the Bouchard-Mézard econophysics model. Users pick a character, choose an economic policy, and watch wealth distribute across the population, with the Gini coefficient and mobility tracked over time. Users can also write custom policies by describing them to an AI assistant or by building them in Blockly.

## Architecture

- **Backend**: Flask REST API in `app.py`. It also serves the frontend pages.
- **Simulation**: Mesa agent-based model in `model.py`, `agent.py`, and `policyblocks.py`.
- **Frontend** (`docs/`): vanilla HTML, CSS, and JavaScript.
  - `index.html`: landing page, which links to `/simulator`.
  - `landing.html` and `game.js` (with `game.css`): the simulator UI.
- **Custom policy builder** (`blockly/`): Blockly editor at `/blockly/`.
- **Policy animations** (`explanatory/`): served at `/explain/<name>`.
- **AI assistant**: Google Gemini, used by `/api/chat` to generate custom policies. Optional.

## Setup

Requires Python 3.13.

```bash
pip install -r requirements.txt
python run.py
```

`run.py` starts the server on http://localhost:5001 and opens your browser. Put `GOOGLE_API_KEY=...` in a `.env` file in the project root to enable the AI assistant. Without it, everything else still works.

### Docker

```bash
docker compose up --build
```

This serves the app on http://localhost:5001. `docker-compose.yml` reads `GOOGLE_API_KEY` from `.env`. See `EC2-SETUP.md` for deploying to AWS.

## Using the Simulator

1. **Landing page** (`/`): click through to the simulator.
2. **Character**: pick a character from the in-scene picker.
3. **Policy**: choose one of the built-in policies, or write a custom one.
4. **Run**: use **STEP** to advance one step, **RUN** to run continuously, and **STOP** to pause.
5. **Results**: the exchange canvas, wealth and Gini data, and mobility data update as the model runs.

### Built-in policies

- **Econophysics**: the baseline wealth-exchange model.
- **Capitalism**
- **Communism**
- **Fascism**
- **Custom**: a policy you write through the AI assistant or in Blockly.

## API Endpoints

All endpoints are under `/api`. The model is held in memory, so the server runs as a single process.

**Simulation**

- `POST /api/initialize`: create a model. Body (all optional): `policy`, `population`, `start_up_required`, `patron`.
- `POST /api/step`: run one simulation step.
- `GET /api/status`: current model status.
- `POST /api/system_reset`: reset the model.
- `GET /api/get_active_policy` and `POST /api/set_active_policy`: read or set the active policy.

**Data**

- `GET /api/data/wealth-distribution`: wealth distribution.
- `GET /api/data/mobility`: mobility data.
- `GET /api/data/gini`: Gini coefficient over time.
- `GET /api/data/total-wealth`: total wealth over time.
- `GET /api/data/exchanges`: exchange data.

**Custom policies**

- `POST /api/chat`: generate a custom policy from a natural-language description. Requires `GOOGLE_API_KEY`.
- `POST /api/add_custom_policy`, `POST /api/update_code`, `POST /api/save_block_definition`: save custom policy code and block definitions.
- `POST /api/reset_code`: reset custom policy code.

**Pages**

- `GET /` and `GET /simulator`: the simulator.
- `GET /blockly/`: the Blockly policy builder.
- `GET /explain/<name>`: policy animations (`econophysics`, `fascism`, `capitalism`, `communism`).

## Project Layout

```
app.py              Flask server: API routes and page routes
run.py              Local runner (port 5001, opens browser)
model.py            WealthModel (Mesa)
agent.py            Agent behaviour
policyblocks.py     Built-in policy implementations
utilities.py        Helper functions
mcp_server.py       Separate Flask app for policy generation (not part of the web app)
user_logic.py,
custom_policies.py  Generated at runtime when users save custom policies
docs/               Frontend: index.html, landing.html, game.js, game.css
blockly/            Blockly policy builder
explanatory/        Policy animations and their assets
Dockerfile,
docker-compose.yml  Container setup
EC2-SETUP.md        AWS deployment guide
```

## Troubleshooting

- **Port 5001 already in use**: change the port in `run.py` and `app.py`, and update `docker-compose.yml` if you use Docker.
- **AI assistant doesn't respond**: check that `GOOGLE_API_KEY` is set in `.env` and that the server was restarted after you added it.
- **Model doesn't initialize**: check that the dependencies are installed, and check the server log for errors.
- **Animations return 404 in Docker**: make sure the image was built from the current `Dockerfile`, which copies `explanatory/`.

## Development

- Landing page: `docs/index.html`
- Simulator layout: `docs/landing.html` and `docs/game.css`
- Simulator behaviour: `docs/game.js`
- API changes: `app.py`
- Model changes: `model.py`, `agent.py`, `policyblocks.py`
