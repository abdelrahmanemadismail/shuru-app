export interface Article {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: any[];
    guest_author_name?: string;
    publish_date?: string;
    is_featured?: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    cover_image?: {
      data?: {
        attributes?: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    author?: {
      data?: {
        attributes?: {
          name: string;
        };
      };
    };
    category?: {
      data?: {
        attributes?: {
          name: string;
        };
      };
    };
  };
}

export interface ArticlesResponse {
  data: Article[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}