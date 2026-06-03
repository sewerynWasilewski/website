---
title: "Portfolio"
description: "My personal portfolio website."
year: "2025"
technologies: ["angular", "js", "css", "docker"]
weight: 4
---

This website — built to have a place to document my projects and write about things I've learned.

## Stack

- **Angular 21** — component-based SPA
- **marked + highlight.js** — markdown rendering with syntax highlighting
- **nginx** — serves the static build inside Docker
- **Docker** — containerized for easy deployment

## Content Management

Blog posts and project descriptions are plain `.md` files stored in `public/content/`. The hierarchy is the directory structure — adding a subdirectory with `_index.md` creates a parent page, and files inside it become children. A build script reads frontmatter from every file and generates `manifest.json` for Angular to consume.

```
public/content/
  blog/
    standalone-post.md
    my-series/
      _index.md        ← parent page
      first-post.md
      second-post.md
  projects/
    my-project/
      _index.md
      sub-topic.md
```

## Deployment

A GitHub Actions workflow builds the Docker image on every push to `main` and deploys it to a VPS via SSH.
