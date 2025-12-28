import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project, Pagination } from '../../../core/models/api.models';
import { finalize } from 'rxjs/operators';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-view-projects',
    standalone: true,
    imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
    templateUrl: './view-projects.component.html',
    styleUrl: './view-projects.component.scss'
})
export class ViewProjectsComponent implements OnInit {
    private projectService = inject(ProjectService);

    projects = signal<Project[]>([]);
    pagination = signal<Pagination | null>(null);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    searchTerm = signal<string>('');

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects(page: number = 1) {
        this.isLoading.set(true);
        this.projectService.getProjects({ page, search: this.searchTerm() }).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res: any) => {
                // If it's a PaginatedResult structure (with data and pagination at root)
                if (res.data) {
                    this.projects.set(res.data);
                    if (res.pagination) {
                        this.pagination.set(res.pagination);
                    }
                }
                // Fallback for ApiResponse<T[]> structure without root pagination (if API differs)
                else if (Array.isArray(res)) {
                    this.projects.set(res);
                }
            },
            error: (err) => {
                console.error('Error loading projects', err);
                this.error.set('Failed to load projects');
            }
        });
    }

    onSearch() {
        this.loadProjects(1);
    }

    onPageChange(page: number) {
        this.loadProjects(page);
    }

    deleteProject(id: string) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projectService.deleteProject(id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.projects.update(current => current.filter(p => p._id !== id));
                        // Reload to update pagination if needed
                        this.loadProjects(this.pagination()?.page ?? 1);
                    }
                },
                error: (err) => console.error('Error deleting project', err)
            });
        }
    }
}
