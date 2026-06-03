import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DocsShellComponent, SidebarNode } from '../../../shared/components/docs-shell/docs-shell.component';
import { ContentService, ContentEntry } from '../../../core/services/content.service';

function toSidebarNodes(entries: ContentEntry[], basePath: string): SidebarNode[] {
  return entries.map(e => ({
    id: e.id,
    label: e.title,
    routerLink: [basePath, ...e.id.split('/')],
    children: toSidebarNodes(e.children, basePath),
  }));
}

@Component({
  selector: 'app-blog-shell',
  standalone: true,
  imports: [DocsShellComponent],
  template: `<app-docs-shell [nodes]="sidebarNodes()" searchPlaceholder="Search posts..." />`,
})
export class BlogShellComponent {
  private readonly contentService = inject(ContentService);
  private readonly entries = toSignal(this.contentService.getBlogEntries(), { initialValue: [] as ContentEntry[] });

  readonly sidebarNodes = computed(() => toSidebarNodes(this.entries(), '/blog'));
}
