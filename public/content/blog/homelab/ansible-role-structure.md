---
title: "How I Structure Ansible Roles"
date: "2026-03-18"
excerpt: "A practical way to keep Ansible roles clean and reusable."
technologies: ["ansible", "linux"]
weight: 2
---

After writing Ansible for a while I settled on a structure that keeps roles testable, readable, and easy to drop into any playbook.

## The Standard Layout

```
roles/
  nginx/
    defaults/
      main.yml      # defaults (low precedence, always overridable)
    vars/
      main.yml      # constants that shouldn't change per environment
    tasks/
      main.yml      # entry point — includes sub-task files
      install.yml
      configure.yml
    handlers/
      main.yml
    templates/
      nginx.conf.j2
    files/
      index.html
    meta/
      main.yml      # role dependencies
```

## Rules I Follow

**1. defaults for everything that might vary.** If a caller might want to change it, put it in `defaults/`. This makes roles reusable without forking.

```yaml
# defaults/main.yml
nginx_port: 80
nginx_worker_processes: auto
nginx_keepalive_timeout: 65
```

**2. Split tasks into logical files, include them from `main.yml`.**

```yaml
# tasks/main.yml
- name: Install
  ansible.builtin.import_tasks: install.yml

- name: Configure
  ansible.builtin.import_tasks: configure.yml
```

**3. Handlers only for service restarts.** Don't put business logic in handlers — they're for side effects like reloading nginx after a config change.

**4. Name every task explicitly.** `- name: Install nginx` > `- apt: name=nginx`. The name shows up in logs and makes failures obvious.

## Testing

I use `molecule` with the Docker driver to test roles in isolation before using them in production playbooks.

```bash
cd roles/nginx
molecule test
```

:::note
The [Ansible documentation on roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) is worth reading in full at least once.
:::
