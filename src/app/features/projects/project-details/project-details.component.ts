import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

import { MarkdownRendererComponent } from '../../../shared/components/markdown-renderer/markdown-renderer.component';
import { ProjectsAPIService } from '../../../core/services/projects-api.service';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [RouterLink, MarkdownRendererComponent, TitleCasePipe],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css',
})
export class ProjectDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsAPIService);
  private readonly contentService = inject(ContentService);

  private readonly id$ = this.route.paramMap.pipe(
    map(params => {
      const section = params.get('section');
      const slug = params.get('slug') ?? '';
      return section ? `${section}/${slug}` : slug;
    })
  );

  readonly project = toSignal(
    this.id$.pipe(switchMap(id => this.projectsService.getProject(id))),
    { initialValue: null }
  );

  readonly content = toSignal(
    this.id$.pipe(switchMap(id => this.projectsService.getProjectContent(id))),
    { initialValue: '' }
  );

  readonly basePath = toSignal(
    this.id$.pipe(
      switchMap(id => this.contentService.findProjectEntry(id)),
      map(e => {
        if (!e?.contentPath) return '';
        const dir = e.contentPath.slice(0, e.contentPath.lastIndexOf('/') + 1);
        return `content/${dir}`;
      })
    ),
    { initialValue: '' }
  );
}
