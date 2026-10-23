# EC2 One-Time Setup

## 1. Install Docker

```bash
sudo yum update -y          # Amazon Linux 2023
sudo yum install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and back in for group change

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

## 2. Clone repo and set env vars

```bash
cd ~
git clone https://github.com/YOUR_ORG/inequality-simulator.git
cd inequality-simulator
echo "GOOGLE_API_KEY=your-key-here" > .env
```

## 3. First run

```bash
docker compose up -d --build
```

## 4. Nginx reverse proxy (optional)

```bash
sudo yum install -y nginx
sudo tee /etc/nginx/conf.d/inequality-simulator.conf <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo systemctl enable --now nginx
```

## 5. GitHub Secrets

Add these to the repo's Settings > Secrets > Actions:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | `ec2-user` (Amazon Linux) |
| `EC2_SSH_KEY` | Contents of your SSH private key |
