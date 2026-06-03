---
title: "Homelab"
description: "My personal space to learn and practice DevOps topics."
year: "2023"
technologies: ["proxmox", "terraform", "ansible", "docker", "linux"]
weight: 1
---

My homelab is a self-hosted infrastructure running on a second-hand server in my apartment. It started as a place to experiment with Proxmox and gradually evolved into a full DevOps learning environment.

## Infrastructure

The server runs **Proxmox VE** as the hypervisor, managing a mix of VMs and LXC containers. All provisioning is handled by **Terraform** (infrastructure as code) and **Ansible** (configuration management), so rebuilding from scratch is a matter of running a few commands.

```bash
terraform init
terraform apply
ansible-playbook site.yml
```

## Services Running

- **Nginx reverse proxy** — routes traffic to internal services
- **Gitea** — self-hosted Git
- **Grafana + Prometheus** — monitoring stack
- **Portainer** — Docker container management

## What I Learned

Running a homelab forces you to deal with real-world problems: disk failures, network misconfigurations, certificate renewals, and backup strategies. It's been the single best learning tool in my DevOps journey.

:::note
All VMs are provisioned from cloud-init templates, which makes spinning up a new node under 2 minutes.
:::
