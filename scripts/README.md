# Deployment scripts

- `deploy.sh`: pulls the commit-tagged GHCR images, provisions HTTPS on first deploy, starts the stack and checks `/ready`.
- `renew-certificate.sh`: renews the Let's Encrypt certificate; schedule it monthly on the VM. See [deployment setup](../docs/DEPLOYMENT.md).
