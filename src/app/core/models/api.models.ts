// ==================== Common Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface Pagination {
  total: number;
  page?: number;
  current?: number;
  pages: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T & {
    pagination: Pagination;
  };
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T;
  pagination: Pagination;
}

// ==================== Auth & User Models ====================
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  profileImage?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
  notifications?: NotificationSettings;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  isActive: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  // Allow id for backward compatibility/login response
  id?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      username: string;
      email: string;
      role: 'super_admin' | 'admin' | 'user';
      profileImage?: string;
    };
    token: string;
  };
}

// ==================== Dashboard Models ====================
export interface DashboardOverview {
  totalContacts: number;
  totalProjects: number;
  totalBlogs: number;
  totalVisitors: number;
  totalComments: number;
  totalNewsletterSubscribers: number;
  totalNewsletterCampaigns: number;
}

export interface DashboardGrowth {
  visitors: { weekly: string; monthly: string };
  comments: { weekly: string; monthly: string };
}

export interface DashboardAnalytics {
  today: AnalyticsDayData;
  weekly: AnalyticsDayData[];
  monthly: AnalyticsDayData[];
}

export interface AnalyticsDayData {
  _id: string;
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    title: string;
    _id: string;
  }>;
  referrers: any[];
  devices: any[];
  countries: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DashboardTopContent {
  projects: Array<{
    _id: string;
    title: string;
    viewsCount: number;
    likes: number;
  }>;
  blogs: Array<{
    _id: string;
    title: string;
    category: string;
    viewsCount: number;
    likes: number;
  }>;
  pages: Array<{
    _id: string;
    totalViews: number;
  }>;
}

export interface DashboardDemographics {
  devices: Array<{ _id: string; count: number }>;
  countries: Array<{ _id: string | null; count: number }>;
  browsers: Array<{ _id: string | null; count: number }>;
}

export interface DashboardRecent {
  contacts: any[]; // Empty in example, assuming array
  projects: Array<{
    _id: string;
    title: string;
    status: string;
    viewsCount: number;
    createdAt: string;
  }>;
  blogs: Array<{
    _id: string;
    title: string;
    status: string;
    viewsCount: number;
    createdAt: string;
  }>;
  visitors: Array<{
    _id: string;
    ipAddress: string;
    landingPage: string;
    sessionDuration: number;
    lastVisit: string;
    visitCount: number;
    device: {
      type: string;
      os: string;
      browser: string;
    };
  }>;
  comments: any[];
}

export interface DashboardData {
  overview: DashboardOverview;
  growth: DashboardGrowth;
  analytics: DashboardAnalytics;
  topContent: DashboardTopContent;
  demographics: DashboardDemographics;
  recent: DashboardRecent;
}

// Backward compatibility - flattened version for old components
export interface DashboardStats {
  totalContacts?: number;
  totalProjects?: number;
  totalBlogs?: number;
  totalVisitors?: number;
  totalComments?: number;
  totalUsers?: number;
  recentProjects?: any[];
  recentBlogs?: any[];
  recentContacts?: any[];
  contactStats?: any[];
  projectStats?: any[];
  blogStats?: any[];
}

export interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface PopularContent {
  _id: string;
  title: string;
  type: 'blog' | 'project';
  views: number;
  likes: number;
}

// ==================== Analytics Models ====================
export interface AnalyticsDayData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  sessionDuration: number;
}

export interface AnalyticsMetrics {
  avgPageViews: number;
  avgUniqueVisitors: number;
  avgBounceRate: number;
  avgSessionDuration: number;
}

export interface AnalyticsData {
  analytics: AnalyticsDayData[];
  metrics: AnalyticsMetrics;
  period: string;
  totalDays: number;
}

export interface VisitorStatsData {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  averageSessionDuration: string;
  bounceRate: string;
  topCountries: CountryStats[];
  hourlyDistribution: HourlyStats[];
}

export interface CountryStats {
  country: string;
  visitors: number;
  percentage: number;
}

export interface HourlyStats {
  hour: number;
  visitors: number;
}

export interface VisitorsResponse {
  visitors: Visitor[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  stats: {
    totalUnique: number;
    returning: number;
    new: number;
  };
}

export interface Visitor {
  _id: string;
  ip: string;
  location: {
    country: string;
    city: string;
  };
  device: {
    type: string;
    browser: string;
    os: string;
  };
  visitCount: number;
  lastVisit: string;
}

export interface LegacyStats {
  projects: number;
  blogs: number;
  experiences: number;
  education: number;
  skills: number;
  certifications: number;
  testimonials: number;
}

export interface SystemLog {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  meta?: any;
}

// ==================== Content Models - Projects ====================
export * from './project.model';

export interface ProjectStats {
  total: number;
  main: number;
  mini: number;
  active: number;
  archived: number;
}

export interface TechnologyStats {
  technology: string;
  count: number;
}

export interface CategoryStats {
  category: string;
  count: number;
}

// ==================== Content Models - Blogs ====================
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  viewsCount: number;
  likes: number;
  comments: any[];
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  isFeatured: boolean;
  relatedPosts: any[];
  coverImage?: string; // Kept as optional for UI compatibility if missing in API
  __v?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
  totalLikes: number;
}

export interface TagStats {
  tag: string;
  count: number;
}

// ==================== Content Models - Experiences ====================
export interface Experience {
  _id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean; // Changed to match JSON
  description: string;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  companyWebsite?: string;
  employmentType?: string;
  industry?: string;
  teamSize?: number;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceStats {
  total: number;
  current: number;
  past: number;
  totalYearsOfExperience: number;
  byCompany: CompanyStats[];
  topTechnologies: string[];
}

export interface CompanyStats {
  company: string;
  duration: number;
}

// ==================== Content Models - Education ====================
export interface Education {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean; // Changed to match JSON
  gpa?: number; // Changed to match JSON
  skills?: string[];
  activities?: string[];
  achievements?: string[];
  description?: string;
  location?: string;
  website?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationStats {
  total: number;
  highestDegree: string;
}

// ==================== Content Models - Skills ====================
export interface Skill {
  _id: string;
  name: string;
  category: string; // broadened type as JSON has 'tool', 'technical', 'framework', 'soft'
  level: string; // broadened type as JSON has 'intermediate', 'advanced', 'expert'
  yearsOfExperience?: number;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean; // Changed to match JSON (was isHidden)
  proficiency?: number; // Added for UI progress bar
  projects?: any[];
  certifications?: any[];
  createdAt?: string;
  updatedAt?: string;
  // UI helper
  showMenu?: boolean;
}

export interface SkillStats {
  total: number;
  byCategory: Record<string, number>;
  featured: number;
}

export interface LevelStats {
  level: string;
  count: number;
}

// ==================== Content Models - Certifications ====================
export interface Certification {
  _id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationUrl?: string;
  image?: string;
  skills?: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificationStats {
  total: number;
  active: number;
  expired: number;
}

// ==================== Content Models - Testimonials ====================
export interface Testimonial {
  _id: string;
  clientName: string;
  clientPosition: string;
  clientCompany: string;
  content: string;
  rating: number;
  clientPhoto?: string;
  project?: string;
  platform?: string;
  linkedIn?: string;
  isVerified?: boolean;
  featured?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialStats {
  total: number;
  verified: number;
  featured: number;
  averageRating: number;
}

export interface RatingStats {
  rating: number;
  count: number;
}

// ==================== Media Models ====================
export interface MediaFile {
  url: string;
  key: string;
  provider: 'cloudinary' | 's3';
  name?: string;
  Key?: string;
  Size?: number;
  LastModified?: string;
}

export interface MediaUploadResponse {
  success?: boolean;
  message?: string;
  data: {
    original: {
      url: string;
      key: string;
      provider: string;
      size: number;
      mimetype?: string;
      encoding?: string;
      originalname?: string;
    };
    processed: Array<{
      size: string;
      url: string;
      key: string;
    }>;
    metadata?: {
      originalname: string;
      mimetype: string;
      encoding: string;
    };
  };
}

export interface MediaBatchUploadResponse {
  message: string;
  data: MediaFile[];
}

export interface MediaFilesListResponse {
  files: Array<{
    Key: string;
    Size: number;
    LastModified: string;
    url: string;
  }>;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export interface MediaStatistics {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byFolder: Record<string, number>;
  recentUploads: MediaRecentUpload[];
  // Backward compatibility optional fields if needed
  fileCount?: number;
  imageCount?: number;
}

export interface MediaRecentUpload {
  key: string;
  size: number;
  lastModified: string;
}

// ==================== Comments Models ====================
export interface Comment {
  _id: string;
  author: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: string;
  postId?: string;
  postType?: 'blog' | 'project';
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

// ==================== Contacts Models ====================
export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  createdAt: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface ContactDetailsResponse extends Contact { }

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  responded: number;
}

// ==================== Newsletter Models ====================
export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: 'active' | 'inactive';
  subscribedAt: string;
}

export interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface NewsletterCampaign {
  _id: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: string;
  stats: {
    opens: number;
    clicks: number;
  };
}

export interface CampaignsResponse {
  campaigns: NewsletterCampaign[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

// ==================== Settings Models ====================
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  darkMode: boolean;
  fontFamily?: string;
}

export interface FeatureSettings {
  blog: boolean;
  projects: boolean;
  testimonials: boolean;
  contact: boolean;
  analytics: boolean;
  chatBot: boolean;
  newsletter: boolean;
}

export interface SocialSettings {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ContactSettings {
  email: string;
  phone?: string;
  address?: string;
  mapUrl?: string;
}

export interface PortfolioSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords?: string[];
  theme: ThemeSettings;
  features: FeatureSettings;
  social: SocialSettings;
  contact: {
    email: string;
    phone?: string;
    address?: string;
    mapUrl?: string;
  };
}

export interface AdminProfile {
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
  notifications?: NotificationSettings;
}

export interface UsersResponse {
  users: User[];
  summary: UsersSummary;
  pagination: Pagination;
}

export interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

// ==================== Query Parameters ====================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AnalyticsParams extends DateRangeParams {
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface CommentsParams extends PaginationParams, SortParams {
  status?: 'pending' | 'approved' | 'rejected' | 'spam';
  postType?: 'blog' | 'project';
}

export interface ContactsParams extends PaginationParams, SortParams {
  status?: 'new' | 'read' | 'replied' | 'archived' | 'spam';
  priority?: 'low' | 'medium' | 'high';
}

export interface MediaFilesParams extends PaginationParams {
  type?: 'image' | 'video' | 'document';
  folder?: string;
}

export interface UsersParams extends PaginationParams, SearchParams {
  role?: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive';
}

export interface NewsletterParams extends PaginationParams, SearchParams, SortParams {
  status?: 'subscribed' | 'unsubscribed';
}

export interface LogsParams extends PaginationParams, DateRangeParams {
  level?: 'error' | 'warn' | 'info' | 'debug';
}
