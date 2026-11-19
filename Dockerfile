FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py agent.py model.py run.py utilities.py user_logic.py custom_policies.py policyblocks.py mcp_server.py ./
COPY docs/ docs/
COPY blockly/ blockly/
COPY explanatory/ explanatory/

EXPOSE 5001

# One worker: simulation state lives in memory and must be shared by all requests.
# Threads let long requests (e.g. 50 steps) overlap with other requests.
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "--threads", "4", "--timeout", "120", "--preload", "app:app"]
