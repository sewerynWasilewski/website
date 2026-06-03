import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ContentService, ContentEntry, flattenEntries } from './content.service';

export type ProjectOverview = {
  id: string;
  title: string;
  description: string;
  year: string;
  technologies: string[];
};

function entryToProject(e: ContentEntry): ProjectOverview {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? e.excerpt ?? '',
    year: e.year ?? '',
    technologies: e.technologies ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectsAPIService {
  private readonly content = inject(ContentService);

  getAllProjects(): Observable<ProjectOverview[]> {
    return this.content.getProjectEntries().pipe(
      map(entries => flattenEntries(entries).map(entryToProject))
    );
  }

  getProject(id: string): Observable<ProjectOverview | null> {
    return this.content.findProjectEntry(id).pipe(
      map(e => (e ? entryToProject(e) : null))
    );
  }

  getProjectContent(id: string): Observable<string> {
    return this.content.findProjectEntry(id).pipe(
      switchMap(e => e?.contentPath ? this.content.getContent(e.contentPath) : of(''))
    );
  }

  getProjectsByTechnology(tech: string): Observable<ProjectOverview[]> {
    const normalizedTech = tech.trim().toLowerCase();
    return this.getAllProjects().pipe(
      map(projects =>
        projects.filter(p =>
          p.technologies.some(t => t.toLowerCase() === normalizedTech)
        )
      )
    );
  }

  getFeaturedProjects(limit = 3): Observable<ProjectOverview[]> {
    return this.getAllProjects().pipe(map(p => p.slice(0, limit)));
  }
}
