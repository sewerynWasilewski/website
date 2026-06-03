import { Component, computed, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarNodeComponent } from './sidebar-node/sidebar-node.component';

export type SidebarNode = {
  id: string;
  label: string;
  routerLink: string[];
  children: SidebarNode[];
};

function flattenTree(nodes: SidebarNode[]): SidebarNode[] {
  return nodes.flatMap(n => [n, ...flattenTree(n.children)]);
}

@Component({
  selector: 'app-docs-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SidebarNodeComponent],
  templateUrl: './docs-shell.component.html',
  styleUrl: './docs-shell.component.css',
})
export class DocsShellComponent {
  readonly nodes = input<SidebarNode[]>([]);
  readonly searchPlaceholder = input('Search...');

  private readonly searchQuery = signal('');
  readonly sidebarOpen = signal(false);
  readonly exactOptions = { exact: true };

  readonly isSearching = computed(() => this.searchQuery().trim().length > 0);

  readonly searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return flattenTree(this.nodes()).filter(n =>
      n.label.toLowerCase().includes(q)
    );
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
