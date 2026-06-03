import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { ProjectDetailsComponent } from './features/projects/project-details/project-details.component';
import { BlogComponent } from './features/blog/blog.component';
import { BlogDetailsComponent } from './features/blog/blog-details/blog-details.component';
import { BlogShellComponent } from './features/blog/blog-shell/blog-shell.component';
import { ProjectsShellComponent } from './features/projects/projects-shell/projects-shell.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'projects',
    component: ProjectsShellComponent,
    children: [
      { path: '', component: ProjectsComponent },
      { path: ':slug', component: ProjectDetailsComponent },
      { path: ':section/:slug', component: ProjectDetailsComponent },
    ],
  },
  {
    path: 'blog',
    component: BlogShellComponent,
    children: [
      { path: '', component: BlogComponent },
      { path: ':slug', component: BlogDetailsComponent },
      { path: ':section/:slug', component: BlogDetailsComponent },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
