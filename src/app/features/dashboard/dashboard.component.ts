import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats = signal<DashboardData | null>(null);

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
        next: (res: any) => {
            if(res.success) {
                this.stats.set(res.data);
            }
        },
      error: (err: any) => console.error('Failed to load dashboard data', err)
    });
  }
}
