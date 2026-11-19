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

The instance needs read access to the private repo. Create a read-only deploy key on the instance (`ssh-keygen -t ed25519`) and add the public key under the repo's Settings > Deploy keys.

```bash
cd ~
git clone git@github.com:decision-advantage-works/inequality-simulator.git
cd inequality-simulator
echo "GOOGLE_API_KEY=your-key-here" > .env
```

## 3. First run

Deploys check out a release tag, not a branch. For the first run, check out the latest release:

```bash
git fetch --tags origin
git checkout "$(git tag --sort=-v:refname | head -1)"
docker compose up -d --build
```

Before the first release exists, there are no tags, so use `git checkout origin/prod` instead.

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
| `EC2_SSH_KEY` | Contents of your SSH private key (use a dedicated deploy key, not your personal key) |

## 6. Deploying a release

The workflow in `.github/workflows/deploy.yml` runs when a GitHub release is published. It checks out that release's tag on the instance and rebuilds the container.

Flow: `deploy/docker-aws` → PR → `main` → `prod` → cut a release from `prod` with a version tag (e.g. `v1.0.0`). Publishing the release deploys it.

To roll back, publish a new release pointing at an earlier commit, or on the instance run `git checkout <old-tag> && docker compose up -d --build`.
