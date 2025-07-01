// types/magazine.ts
export interface Magazine {
  id: string;
  title: string;
  issue: string;
  season: string;
  subtitle?: string;
  description: string;
  author?: string;
  coverImage: string;
  colorBar?: string;
  fullIssueLink?: string;
  issue_number?: number;
}

export interface MagazineArchive {
  id: string;
  title: string;
  season: string;
  image: string;
  colorBar: string;
  fullIssueLink?: string;
  issue_number?: number;
}

export interface MagazineDetails {
  id: string;
  title: string;
  issue: string;
  season: string;
  description: string;
  coverImage: string;
  mainArticle: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  sideArticles: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  }[];
  galleryImages: {
    image: string;
    imageAlt: string;
  }[];
  latestNews: {
    title: string;
    items: {
      category: string;
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    }[];
  };
}

export interface Article {
  id: string;
  title: string;
  description: string;
  excerpt?: string;
  author?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  cover_image?: {
    url: string;
    alternativeText?: string;
  };
  is_featured?: boolean;
  imageAlt?: string;
}

export interface Feature {
  title: string;
  description: string;
}

// Strapi API Response Types
export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: string;
}

export interface StrapiMagazineIssue {
  id: string;
  title: string;
  slug: string;
  issue_number: number;
  season: string;
  description?: string;
  cover_image?: {
    url: string;
    alternativeText?: string;
  };
  articles?: Article[];
  createdAt: string;
  updatedAt: string;
}