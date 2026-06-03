import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import hljs from 'highlight.js';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  constructor(private sanitizer: DomSanitizer) {
    marked.use({
      gfm: true,
      breaks: true,
    });

    const renderer = new marked.Renderer();

    renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      const escapedRaw = this.escapeHtml(text);

      return `<div class="md-code-block">
  <button class="md-copy-btn" type="button" data-code="${this.escapeAttribute(escapedRaw)}">Copy</button>
  <pre class="md-pre"><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
    };

    marked.use({ renderer });
  }

  render(rawMarkdown: string, basePath = ''): SafeHtml {
    const withCustomBlocks = this.transformCustomBlocks(rawMarkdown);
    const html = marked.parse(withCustomBlocks) as string;
    const resolved = basePath ? this.resolveImagePaths(html, basePath) : html;
    return this.sanitizer.bypassSecurityTrustHtml(resolved);
  }

  private resolveImagePaths(html: string, basePath: string): string {
    // Prefix src values that are relative (no protocol, no leading slash)
    return html.replace(
      /(<img[^>]+src=")(?!https?:\/\/|\/\/|\/|data:)([^"]+)"/g,
      `$1${basePath}$2"`
    );
  }

  private transformCustomBlocks(markdown: string): string {
    return markdown
      .replace(
        /:::note\s*([\s\S]*?):::/g,
        (_, content) => `<div class="md-note">${content.trim()}</div>`
      )
      .replace(
        /:::warning\s*([\s\S]*?):::/g,
        (_, content) => `<div class="md-warning">${content.trim()}</div>`
      )
      .replace(
        /:::info\s*([\s\S]*?):::/g,
        (_, content) => `<div class="md-info">${content.trim()}</div>`
      )
      .replace(
        /:::youtube\s+(.*?)\s*:::/g,
        (_, url) => {
          const embedUrl = this.toYoutubeEmbedUrl(url.trim());
          if (!embedUrl) {
            return `<div class="md-warning">Niepoprawny link YouTube: ${this.escapeHtml(url.trim())}</div>`;
          }

          return `<div class="md-youtube">
  <iframe
    src="${embedUrl}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>`;
        }
      );
  }

  private toYoutubeEmbedUrl(url: string): string | null {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes('youtu.be')) {
        const id = parsed.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}