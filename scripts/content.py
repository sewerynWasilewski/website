#!/usr/bin/env python3
"""
scripts/content.py — developer CLI for managing portfolio content.

Delegates manifest generation to scripts/generate-manifest.mjs (the build tool).
Adds two things on top: creating new content files and listing the content tree.

Commands:
  new blog "Title"                    standalone blog post
  new blog "Title" --parent homelab   child of an existing section
  new blog "Title" --section          new section (directory + _index.md)

  new project "Title"
  new project "Title" --parent homelab
  new project "Title" --section

  manifest                            run generate-manifest.mjs
  list                                print the content tree from manifest.json
"""

import argparse
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT        = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "public" / "content"
MANIFEST    = CONTENT_DIR / "manifest.json"
MJS_SCRIPT  = ROOT / "scripts" / "generate-manifest.mjs"


# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def to_title(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.replace("-", " ").split())


def run_manifest():
    """Delegate to the Node.js build script — single source of truth."""
    result = subprocess.run(
        ["node", str(MJS_SCRIPT)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr.strip(), file=sys.stderr)
        sys.exit(result.returncode)
    print(result.stdout.strip())


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_manifest(_args=None):
    run_manifest()


def cmd_list(_args=None):
    if not MANIFEST.exists():
        print("manifest.json not found — run:  python3 scripts/content.py manifest")
        sys.exit(1)

    data = json.loads(MANIFEST.read_text("utf-8"))

    def print_tree(entries, prefix=""):
        for i, e in enumerate(entries):
            last      = i == len(entries) - 1
            connector = "└─" if last else "├─"
            child_pfx = "   " if last else "│  "
            icon      = "▾ " if e.get("children") else "  "
            meta      = e.get("date") or e.get("year") or ""
            dim, rst  = "\033[2m", "\033[0m"
            print(f"{prefix}{connector} {icon}{e['title']}  {dim}[{e['id']}]  {meta}{rst}")
            if e.get("children"):
                print_tree(e["children"], prefix + child_pfx)

    print("\n\033[1m📝  Blog\033[0m")
    print("─" * 50)
    print_tree(data["blog"])
    print(f"\n\033[1m🛠   Projects\033[0m")
    print("─" * 50)
    print_tree(data["projects"])
    print()


def cmd_new(args):
    kind     = args.kind      # "blog" | "project"
    title    = args.title
    parent   = args.parent
    section  = args.section
    slug     = slugify(title)
    today    = date.today().isoformat()
    base_dir = CONTENT_DIR / ("blog" if kind == "blog" else "projects")

    # Resolve target directory
    if parent:
        target_dir = base_dir / parent
        if not target_dir.is_dir():
            print(f"✗  Parent section not found: {target_dir.relative_to(ROOT)}")
            print(f"   Create it first:  python3 scripts/content.py new {kind} \"{to_title(parent)}\" --section")
            sys.exit(1)
    else:
        target_dir = base_dir

    file_path = (target_dir / slug / "_index.md") if section else (target_dir / f"{slug}.md")
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if file_path.exists():
        print(f"✗  Already exists: {file_path.relative_to(ROOT)}")
        sys.exit(1)

    if kind == "blog":
        body = (
            f'---\n'
            f'title: "{title}"\n'
            f'date: "{today}"\n'
            f'excerpt: "Short description of the post."\n'
            f'technologies: []\n'
            f'weight: 10\n'
            f'---\n\n'
            f'Write your post here.\n'
        )
    else:
        body = (
            f'---\n'
            f'title: "{title}"\n'
            f'description: "Short description of the project."\n'
            f'year: "{today[:4]}"\n'
            f'technologies: []\n'
            f'weight: 10\n'
            f'---\n\n'
            f'Write your project description here.\n'
        )

    file_path.write_text(body, "utf-8")
    print(f"✓  Created: {file_path.relative_to(ROOT)}")
    run_manifest()


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(
        prog="content.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("manifest", help="Run generate-manifest.mjs (same as npm run manifest)")
    sub.add_parser("list",     help="Print the content tree from manifest.json")

    new_p = sub.add_parser("new", help="Scaffold a new blog post or project page")
    new_p.add_argument("kind",  choices=["blog", "project"])
    new_p.add_argument("title", help='e.g. "My Post Title"')
    new_p.add_argument("--parent",  metavar="SLUG", help="Parent section slug, e.g. homelab")
    new_p.add_argument("--section", action="store_true",
                       help="Create as a section parent (directory + _index.md)")

    args = p.parse_args()
    {"manifest": cmd_manifest, "list": cmd_list, "new": cmd_new}[args.command](args)


if __name__ == "__main__":
    main()
