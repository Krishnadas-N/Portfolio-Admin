import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { ToastService } from '../../../core/services/toast.service';
import { PortfolioComment, CommentStats, CommentStatus } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-comments',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './view-comments.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class ViewCommentsComponent implements OnInit {
    private commentService = inject(CommentService);
    private toastService = inject(ToastService);

    comments = signal<PortfolioComment[]>([]);
    stats = signal<CommentStats | null>(null);
    pagination = signal<any>(null);
    isLoading = signal<boolean>(false);
    activeStatus = signal<CommentStatus | undefined>(undefined);

    // For filters
    postTypes = ['blog', 'project'];

    ngOnInit() {
        this.loadComments();
    }

    loadComments(page: number = 1) {
        this.isLoading.set(true);
        const query: any = { page, limit: 10 };
        if (this.activeStatus()) {
            query.status = this.activeStatus();
        }

        this.commentService.getComments(query).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.comments.set(res.data.comments);
                    this.pagination.set(res.data.pagination);
                    if (res.data.stats) {
                        this.stats.set(res.data.stats);
                    }
                }
            },
            error: () => this.toastService.error('Failed to load comments')
        });
    }

    setStatusFilter(status: CommentStatus | undefined) {
        this.activeStatus.set(status);
        this.loadComments(1);
    }

    updateStatus(id: string, status: CommentStatus) {
        this.commentService.updateCommentStatus(id, status).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success(`Comment marked as ${status}`);
                    // Update local state or reload
                    this.updateLocalComment(id, { status: res.data.status as CommentStatus });
                    this.loadComments(this.pagination()?.current || 1); // Reload to update stats
                }
            },
            error: () => this.toastService.error('Failed to update status')
        });
    }

    deleteComment(id: string) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        this.commentService.deleteComment(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastService.success('Comment deleted');
                    this.loadComments(this.pagination()?.current || 1);
                }
            },
            error: () => this.toastService.error('Failed to delete comment')
        });
    }

    onPageChange(page: number) {
        this.loadComments(page);
    }

    private updateLocalComment(id: string, updates: Partial<PortfolioComment>) {
        this.comments.update(list =>
            list.map(c => c._id === id ? { ...c, ...updates } : c)
        );
    }

    getAvatar(name: string) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }

    getPostTitle(comment: PortfolioComment): string {
        if (comment.postId && typeof comment.postId === 'object' && 'title' in comment.postId) {
            return (comment.postId as any).title;
        }
        return 'Unknown Post';
    }
}
