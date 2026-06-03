import { Component, effect, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarNode } from '../docs-shell.component';

function hasActiveDescendant(node: SidebarNode, url: string): boolean {
  return node.children.some(child => {
    const childUrl = child.routerLink.join('/');
    return url.includes(childUrl) || hasActiveDescendant(child, url);
  });
}

@Component({
  selector: 'app-sidebar-node',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SidebarNodeComponent],
  templateUrl: './sidebar-node.component.html',
  styleUrl: './sidebar-node.component.css',
})
export class SidebarNodeComponent {
  readonly node = input.required<SidebarNode>();
  readonly depth = input(0);
  readonly navigate = output<void>();

  readonly expanded = signal(false);
  readonly exactOptions = { exact: true };

  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    effect(() => {
      if (hasActiveDescendant(this.node(), this.currentUrl())) {
        this.expanded.set(true);
      }
    });
  }

  toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.expanded.update(v => !v);
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
