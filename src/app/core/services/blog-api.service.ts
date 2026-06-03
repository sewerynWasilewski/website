import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ContentService, ContentEntry, flattenEntries } from './content.service';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  technologies: string[];
}

function entryToPost(e: ContentEntry): BlogPost {
  return {
    id: e.id,
    title: e.title,
    excerpt: e.excerpt ?? '',
    date: e.date ?? '',
    technologies: e.technologies ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly content = inject(ContentService);

  getAllPosts(): Observable<BlogPost[]> {
    return this.content.getBlogEntries().pipe(
      map(entries => flattenEntries(entries).map(entryToPost))
    );
  }

  getPost(id: string): Observable<BlogPost | null> {
    return this.content.findBlogEntry(id).pipe(
      map(e => (e ? entryToPost(e) : null))
    );
  }

  getPostContent(id: string): Observable<string> {
    return this.content.findBlogEntry(id).pipe(
      switchMap(e => e?.contentPath ? this.content.getContent(e.contentPath) : of(''))
    );
  }
}
