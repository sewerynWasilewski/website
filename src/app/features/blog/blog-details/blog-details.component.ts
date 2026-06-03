import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

import { MarkdownRendererComponent } from '../../../shared/components/markdown-renderer/markdown-renderer.component';
import { BlogService } from '../../../core/services/blog-api.service';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [RouterLink, MarkdownRendererComponent, TitleCasePipe],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css',
})
export class BlogDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly contentService = inject(ContentService);

  private readonly id$ = this.route.paramMap.pipe(
    map(params => {
      const section = params.get('section');
      const slug = params.get('slug') ?? '';
      return section ? `${section}/${slug}` : slug;
    })
  );

  readonly post = toSignal(
    this.id$.pipe(switchMap(id => this.blogService.getPost(id))),
    { initialValue: null }
  );

  readonly content = toSignal(
    this.id$.pipe(switchMap(id => this.blogService.getPostContent(id))),
    { initialValue: '' }
  );

  readonly basePath = toSignal(
    this.id$.pipe(
      switchMap(id => this.contentService.findBlogEntry(id)),
      map(e => {
        if (!e?.contentPath) return '';
        const dir = e.contentPath.slice(0, e.contentPath.lastIndexOf('/') + 1);
        return `content/${dir}`;
      })
    ),
    { initialValue: '' }
  );
}
