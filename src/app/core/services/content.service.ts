import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export type ContentEntry = {
  id: string;
  title: string;
  date?: string;
  excerpt?: string;
  description?: string;
  year?: string;
  technologies?: string[];
  contentPath: string | null;
  children: ContentEntry[];
};

type Manifest = {
  blog: ContentEntry[];
  projects: ContentEntry[];
};

function findById(entries: ContentEntry[], id: string): ContentEntry | null {
  for (const entry of entries) {
    if (entry.id === id) return entry;
    const found = findById(entry.children, id);
    if (found) return found;
  }
  return null;
}

export function flattenEntries(entries: ContentEntry[]): ContentEntry[] {
  return entries.flatMap(e => [e, ...flattenEntries(e.children)]);
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly manifest$ = this.http
    .get<Manifest>('content/manifest.json')
    .pipe(shareReplay(1));

  getBlogEntries(): Observable<ContentEntry[]> {
    return this.manifest$.pipe(map(m => m.blog));
  }

  getProjectEntries(): Observable<ContentEntry[]> {
    return this.manifest$.pipe(map(m => m.projects));
  }

  findBlogEntry(id: string): Observable<ContentEntry | null> {
    return this.getBlogEntries().pipe(map(entries => findById(entries, id)));
  }

  findProjectEntry(id: string): Observable<ContentEntry | null> {
    return this.getProjectEntries().pipe(map(entries => findById(entries, id)));
  }

  getContent(contentPath: string): Observable<string> {
    return this.http
      .get(`content/${contentPath}`, { responseType: 'text' })
      .pipe(
        map(raw => stripFrontmatter(raw)),
        catchError(() => of(''))
      );
  }
}

function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length).trim() : raw.trim();
}
