export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  skills: string[];
  projectType: 'main' | 'mini';
  startDate: string;
  endDate?: string;
  link?: string;
  repo?: string;
  images?: string[];
  tags?: string[];
  collaborators?: string[];
  featured?: boolean;
  archived?: boolean;
  status?: string;
  viewsCount?: number;
  likes?: number;
  seoKeywords?: string[];
  additionalResources?: string[];
  relatedProjects?: string[];
  deploymentDetails?: Array<{
    platform: string;
    url: string;
    _id?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
