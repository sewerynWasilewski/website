---
title: "Monitoring Stack"
description: "Grafana + Prometheus setup for observability across the homelab."
year: "2024"
technologies: ["grafana", "docker", "linux"]
weight: 1
---

A full observability setup for the homelab using **Grafana** and **Prometheus**, running as Docker containers managed by Ansible.

## Components

| Component | Purpose |
|-----------|---------|
| Prometheus | Metrics scraping and storage |
| Node Exporter | Host-level metrics (CPU, RAM, disk, network) |
| cAdvisor | Container metrics |
| Grafana | Dashboards and alerting |
| Alertmanager | Alert routing (email / Telegram) |

## Setup

All containers are defined in a single `docker-compose.yml` and deployed via an Ansible role:

```bash
ansible-playbook site.yml --tags monitoring
```

Grafana provisioning uses JSON files for dashboards and YAML for data sources — no manual UI configuration needed after deploy.

## Dashboards

- **Node overview** — per-host CPU, memory, disk I/O, network traffic
- **Docker** — per-container resource usage from cAdvisor
- **Alerts** — active alerts with severity and last-triggered time
