FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py agent.py model.py run.py utilities.py user_logic.py custom_policies.py policyblocks.py mcp_server.py ./
COPY docs/ docs/
COPY blockly/ blockly/

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--timeout", "120", "--preload", "app:app"]
