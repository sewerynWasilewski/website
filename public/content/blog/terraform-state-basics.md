---
title: "Terraform State Basics"
date: "2026-03-20"
excerpt: "A short introduction to how Terraform state works and what to watch out for."
technologies: ["terraform"]
weight: 1
---

Terraform tracks the real-world state of your infrastructure in a **state file** (`terraform.tfstate`). Understanding how it works saves you from a lot of painful surprises.

## What the State File Is

Every time you run `terraform apply`, Terraform writes the current state of all managed resources into the state file. On the next run it compares the desired state (your `.tf` files) against the recorded state to figure out what needs to change.

```bash
# See what's currently tracked
terraform state list

# Inspect a specific resource
terraform state show aws_instance.web
```

## Remote State

For anything beyond a single laptop, store state remotely — not in git. The file contains sensitive data (passwords, private keys) and needs locking to prevent concurrent writes.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "tf-state-lock"
    encrypt        = true
  }
}
```

## Common Gotchas

- **Never delete the state file.** Terraform will think all resources are gone and try to recreate them on the next apply.
- **Don't edit it by hand.** Use `terraform state mv` / `terraform state rm` if you need to restructure.
- **State drift** happens when someone changes infrastructure outside of Terraform. Run `terraform plan` regularly to catch it early.

:::warning
Committing `terraform.tfstate` to git is a security risk. Add it to `.gitignore` and use a remote backend instead.
:::
