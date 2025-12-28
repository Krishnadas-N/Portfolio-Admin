import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData, SystemLog, AnalyticsData, VisitorsResponse, LegacyStats } from '../../core/models/api.models';

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
  analytics = signal<AnalyticsData | null>(null);
  visitors = signal<VisitorsResponse | null>(null);
  contentStats = signal<LegacyStats | null>(null);
  logs = signal<SystemLog[]>([]);
  isLoading = signal<boolean>(true);
  activeTab = signal<'overview' | 'analytics' | 'visitors' | 'logs'>('overview');

  ngOnInit() {
    this.isLoading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.stats.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load dashboard data', err);
        this.isLoading.set(false);
      }
    });

    // Load all data
    this.loadAnalytics();
    this.loadVisitors();
    this.loadContentStats();
    this.loadLogs();
  }

  setActiveTab(tab: 'overview' | 'analytics' | 'visitors' | 'logs') {
    this.activeTab.set(tab);
  }

  loadAnalytics() {
    this.dashboardService.getAnalytics({ period: 'month' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load analytics', err)
    });
  }

  loadVisitors() {
    this.dashboardService.getVisitors({ limit: 10 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.visitors.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load visitors', err)
    });
  }

  loadContentStats() {
    this.dashboardService.getLegacyStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contentStats.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load content stats', err)
    });
  }

  loadLogs() {
    this.dashboardService.getLogs({ limit: 100 }).subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          this.logs.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load logs', err)
    });
  }
}
