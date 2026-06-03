import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BlogService, BlogPost } from '../../core/services/blog-api.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);

  private readonly allPosts = toSignal(this.blogService.getAllPosts(), {
    initialValue: [] as BlogPost[],
  });

  readonly techFilter = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('tech')?.trim().toLowerCase() ?? '')
    ),
    { initialValue: '' }
  );

  readonly filteredBlogs = computed(() => {
    const tech = this.techFilter();
    if (!tech) return this.allPosts();
    return this.allPosts().filter(post =>
      post.technologies.some(t => t.toLowerCase() === tech)
    );
  });

  blogLink(id: string): string[] {
    return ['/blog', ...id.split('/')];
  }

  trackByBlog(index: number, blog: BlogPost): string {
    return blog.id;
  }
}
