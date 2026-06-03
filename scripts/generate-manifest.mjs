import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, '../public/content');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, body: raw.trim() };

  const body = raw.slice(match[0].length).trim();
  const meta = {};

  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();

    if (raw.startsWith('[')) {
      meta[key] = raw
        .slice(1, raw.lastIndexOf(']'))
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      meta[key] = raw.replace(/^["']|["']$/g, '');
    }
  }

  return { meta, body };
}

function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function walkDir(dirPath, relPath) {
  const entries = [];
  const items = readdirSync(dirPath).sort();

  // Separate dirs and files (dirs first so sections appear before leaf articles)
  const dirs = items.filter(i => statSync(join(dirPath, i)).isDirectory());
  const files = items.filter(i => i !== '_index.md' && extname(i) === '.md');

  for (const dir of dirs) {
    const childDirPath = join(dirPath, dir);
    const childRelPath = `${relPath}/${dir}`;
    const indexPath = join(childDirPath, '_index.md');

    let meta = {};
    let hasIndex = false;
    try {
      const raw = readFileSync(indexPath, 'utf-8');
      meta = parseFrontmatter(raw).meta;
      hasIndex = true;
    } catch {
      console.warn(`[warn] No _index.md in ${childDirPath}`);
    }

    const children = walkDir(childDirPath, childRelPath);
    const weight = meta.weight ? Number(meta.weight) : 999;

    entries.push({
      _weight: weight,
      id: childRelPath.replace(/^(?:blog|projects)\//, ''),
      title: meta.title || toTitle(dir),
      date: meta.date,
      excerpt: meta.excerpt || meta.description,
      description: meta.description,
      year: meta.year,
      technologies: meta.technologies ?? [],
      contentPath: hasIndex ? `${childRelPath}/_index.md` : null,
      children,
    });
  }

  for (const file of files) {
    const filePath = join(dirPath, file);
    const fileRelPath = `${relPath}/${file}`;
    const slug = basename(file, '.md');
    const raw = readFileSync(filePath, 'utf-8');
    const { meta } = parseFrontmatter(raw);
    const weight = meta.weight ? Number(meta.weight) : 999;

    entries.push({
      _weight: weight,
      id: `${relPath}/${slug}`.replace(/^(?:blog|projects)\//, ''),
      title: meta.title || toTitle(slug),
      date: meta.date,
      excerpt: meta.excerpt || meta.description,
      description: meta.description,
      year: meta.year,
      technologies: meta.technologies ?? [],
      contentPath: fileRelPath,
      children: [],
    });
  }

  // Sort: by weight asc, then by date desc (for blog), then title asc
  entries.sort((a, b) => {
    if (a._weight !== b._weight) return a._weight - b._weight;
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return a.title.localeCompare(b.title);
  });

  // Strip internal _weight before returning
  return entries.map(({ _weight, ...e }) => e);
}

const blog = walkDir(join(contentRoot, 'blog'), 'blog');
const projects = walkDir(join(contentRoot, 'projects'), 'projects');

const manifest = { blog, projects };
writeFileSync(join(contentRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));

const total = blog.length + projects.length;
console.log(`manifest.json written — ${blog.length} blog entries, ${projects.length} project entries (${total} total, excluding nested)`);
