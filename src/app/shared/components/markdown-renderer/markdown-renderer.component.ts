import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from '../../../core/services/markdown.service';

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './markdown-renderer.component.html',
  styleUrl: './markdown-renderer.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownRendererComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) content = '';
  @Input() basePath = '';

  renderedContent: SafeHtml = '';

  private markdownService = inject(MarkdownService);
  private host = inject(ElementRef<HTMLElement>);

  ngOnChanges(): void {
    this.renderedContent = this.markdownService.render(this.content, this.basePath);
  }

  ngAfterViewInit(): void {
    this.bindCopyButtons();
  }

  private bindCopyButtons(): void {
    this.host.nativeElement.addEventListener('click', async (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.classList.contains('md-copy-btn')) {
        return;
      }

      const code = target.getAttribute('data-code') ?? '';
      await navigator.clipboard.writeText(code);
      const previous = target.textContent;
      target.textContent = 'Copied!';
      setTimeout(() => {
        target.textContent = previous;
      }, 1200);
    });
  }
}