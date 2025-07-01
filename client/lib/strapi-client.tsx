// lib/strapi-client.ts - Updated Articles Functions
import { strapi } from "@strapi/client";
import { getStrapiURL } from "./utils";

// Generic Strapi response type
export type StrapiResponse<T> = {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
    [key: string]: any;
  };
  [key: string]: any;
};

const PATH = "/api";
const STRAPI_BASE_URL = getStrapiURL();
const url = new URL(PATH, STRAPI_BASE_URL);
const client = strapi({ baseURL: url.toString() });

// Article Types
export interface ArticleBlock {
  __component: string;
  content?: string;
  [key: string]: any;
}

export interface ArticleAttributes {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  is_featured?: boolean;
  publish_date?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  cover_image?: {
    data?: {
      id: number;
      attributes: {
        name: string;
        url: string;
        alternativeText?: string;
        caption?: string;
        width?: number;
        height?: number;
      };
    };
  };
  author?: {
    data?: {
      id: number;
      attributes: {
        name: string;
        email?: string;
        bio?: string;
        avatar?: {
          data?: {
            attributes: {
              url: string;
              alternativeText?: string;
            };
          };
        };
      };
    };
  };
  guest_author_name?: string;
  category?: {
    data?: {
      id: number;
      attributes: {
        name: string;
        description?: string;
        slug?: string;
      };
    };
  };
  blocks?: ArticleBlock[];
  SEO?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_image?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export interface Article {
  id: number;
  attributes: ArticleAttributes;
}

// Get all articles with populated relations
export async function getAllArticles(): Promise<StrapiResponse<Article[]>> {
  try {
    console.log('🚀 Fetching all articles...');
    
    const query = {
      populate: [
        'cover_image',
        'author.avatar',
        'category',
        'blocks',
        'SEO.og_image'
      ],
      sort: ['createdAt:desc'],
      filters: {
        publishedAt: {
          $notNull: true,
        },
      },
    };

    const response = await client.collection("pages").find(query);
    
    console.log('✅ Articles fetched successfully:', response);
    
    return {
      data: (response.data.slice(0, 6) || []).map((doc: any) => ({
        id: doc.id,
        attributes: doc.attributes,
      })),
      meta: response.meta || {}
    };
    
  } catch (error) {
    console.error('💥 Error fetching articles:', error);
    throw new Error(`Failed to fetch articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get single article by slug with populated relations
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    console.log(`🔍 Fetching article with slug: ${slug}`);
    
    const query = {
      filters: {
        slug: {
          $eq: slug,
        },
        publishedAt: {
          $notNull: true,
        },
      },
      populate: [
        'cover_image',
        'author.avatar',
        'category',
        'blocks',
        'SEO.og_image'
      ],
    };

    const response = await client.collection("pages").find(query);
    
    console.log('📄 Article response:', response);
    
    if (response && Array.isArray(response.data) && response.data.length > 0) {
      const doc = response.data[0];
      const article: Article = {
        id: doc.id,
        attributes: doc.attributes,
      };
      console.log('✅ Article found:', article);
      return article;
    }
    
    console.log('❌ Article not found');
    return null;
    
  } catch (error) {
    console.error('💥 Error fetching article:', error);
    throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get featured articles
export async function getFeaturedArticles(): Promise<StrapiResponse<Article[]>> {
  try {
    console.log('🌟 Fetching featured articles...');
    
    const query = {
      filters: {
        is_featured: {
          $eq: true,
        },
        publishedAt: {
          $notNull: true,
        },
      },
      populate: [
        'cover_image',
        'author.avatar',
        'category'
      ],
      sort: ['createdAt:desc'],
      pagination: {
        limit: 6,
      },
    };

    const response = await client.collection("pages").find(query);
    
    console.log('✅ Featured articles fetched:', response);
    
    return {
      data: (response.data.slice(0, 6) || []).map((doc: any) => ({
        id: doc.id,
        attributes: doc.attributes,
      })),
      meta: response.meta || {}
    };
    
  } catch (error) {
    console.error('💥 Error fetching featured articles:', error);
    throw new Error(`Failed to fetch featured articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get articles by category
export async function getArticlesByCategory(categorySlug: string): Promise<StrapiResponse<Article[]>> {
  try {
    console.log(`📂 Fetching articles for category: ${categorySlug}`);
    
    const query = {
      filters: {
        category: {
          slug: {
            $eq: categorySlug,
          },
        },
        publishedAt: {
          $notNull: true,
        },
      },
      populate: [
        'cover_image',
        'author.avatar',
        'category'
      ],
      sort: ['createdAt:desc'],
    };

    const response = await client.collection("pages").find(query);
    
    console.log('✅ Category articles fetched:', response);
    
    return {
      data: (response.data.slice(0, 6) || []).map((doc: any) => ({
        id: doc.id,
        attributes: doc.attributes,
      })),
      meta: response.meta || {}
    };
    
  } catch (error) {
    console.error('💥 Error fetching category articles:', error);
    throw new Error(`Failed to fetch category articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to get full image URL
export function getImageUrl(imageUrl: string | undefined): string | null {
  if (!imageUrl) return null;
  
  // Handle both relative and absolute URLs
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  return `${baseUrl}${imageUrl}`;
}

// Utility function to get author name
export function getAuthorName(article: Article): string {
  return article.attributes?.author?.data?.attributes?.name || 
         article.attributes?.guest_author_name || 
         'كاتب مجهول';
}

// Utility function to get category name
export function getCategoryName(article: Article): string | null {
  return article.attributes?.category?.data?.attributes?.name || null;
}

// Utility function to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Newsletter functions (keeping existing ones)
export async function submitToNewsletter(email: string) {
  try {    
    const response = await fetch(`${STRAPI_BASE_URL}/api/newsletters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: email,
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitToNewsletterWithJobTitle(email: string, name: string, jobTitle: string) {
  try {    
    const response = await fetch(`${STRAPI_BASE_URL}/api/newsletters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: email,
          name: name,
          jobTitle: jobTitle,
          subscribed_at: new Date().toISOString(),
          is_verified: false
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Newsletter submission error:', error);
    return { success: false, error: error.message };
  }
}

// Magazine functions (keeping existing ones)
export async function getAllPages() {
  const query = {
    fields: ['slug', 'title'],
    sort: ['createdAt:desc'],
  };
  const pages = await client.collection("pages").find(query);
  console.log(pages, "pages")
  return pages;
}

export async function getPageBySlug(slug: string) {
  const query = {
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: ["SEO", "blocks"],
  };
  try {
    const response = await client.collection("pages").find(query);
    console.log(response, "response");
   
    if (response && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

// Magazine functions
export async function getAllMagazines() {
  try {
    console.log('=== getAllMagazines: Starting ===');
    
    const url = `${STRAPI_BASE_URL}/api/magazine-issues`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('=== getAllMagazines: Raw response ===', data);
    
    const magazines = data.data || [];
    
    const result = {
      data: magazines.map((magazine: any, index: number) => {
        const attrs = magazine.attributes || magazine;
        return {
          id: attrs.slug || `magazine-${magazine.id || index}`,
          title: attrs.title || `العدد ${attrs.issue_number || index + 1}`,
          season: attrs.season || "2024",
          image: attrs.cover_image?.data?.attributes?.url || attrs.cover_image?.url || "/maCover.jpg",
          colorBar: "bg-blue-500",
          issue_number: attrs.issue_number || index + 1
        };
      }),
      meta: data.meta || {}
    };
    
    console.log('=== getAllMagazines: Final result ===', result);
    return result;
    
  } catch (error) {
    console.error('=== getAllMagazines: ERROR ===', error);
    return { 
      data: [],
      meta: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getCurrentMagazine() {
  try {
    console.log('=== getCurrentMagazine: Starting ===');
    
    const allMagazines = await getAllMagazines();
    
    if ('error' in allMagazines && allMagazines.error) {
      throw new Error(allMagazines.error);
    }
    
    if (allMagazines.data.length > 0) {
      const sortedMagazines = allMagazines.data.sort((a: any, b: any) => 
        (b.issue_number || 0) - (a.issue_number || 0)
      );
      
      const latestMagazine = sortedMagazines[0];
      const result = {
        id: latestMagazine.id,
        title: latestMagazine.title,
        issue: `العدد ${latestMagazine.issue_number || 'الحالي'}`,
        season: latestMagazine.season,
        coverImage: latestMagazine.image
      };
      
      console.log('=== getCurrentMagazine: Final result ===', result);
      return result;
    }
    
    console.log('=== getCurrentMagazine: No magazines found ===');
    return null;
    
  } catch (error) {
    console.error('=== getCurrentMagazine: ERROR ===', error);
    return null;
  }
}

export async function getMagazineBySlug(slug: string) {
  try {
    console.log(`=== getMagazineBySlug: Starting with slug "${slug}" ===`);
    
    const allMagazines = await getAllMagazines();
    
    if ('error' in allMagazines && allMagazines.error) {
      throw new Error(allMagazines.error);
    }
    
    const targetMagazine = allMagazines.data.find((mag: any) => mag.id === slug);
    
    if (!targetMagazine) {
      console.log('=== getMagazineBySlug: No magazine found with slug ===', slug);
      return null;
    }
    
    let magazineDetails = null;
    try {
      const detailUrl = `${STRAPI_BASE_URL}/api/magazine-issues`;
      const detailResponse = await fetch(detailUrl);
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const magazines = detailData.data || [];
        magazineDetails = magazines.find((m: any) => 
          (m.attributes?.slug || m.slug) === slug
        );
      }
    } catch (err) {
      console.warn('Could not get magazine details:', err);
    }
    
    const attrs = magazineDetails?.attributes || magazineDetails || {};
    const otherMagazines = allMagazines.data.filter((mag: any) => mag.id !== slug);
    
    let relatedArticles: any[] = [];
    try {
      const articlesResponse = await fetch(`${STRAPI_BASE_URL}/api/articles`);
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        relatedArticles = articlesData.data || [];
      }
    } catch (err) {
      console.warn('Could not fetch articles:', err);
    }
    
    const result = {
      title: attrs.title || targetMagazine.title || "مجلة فاست كومباني",
      season: attrs.season || targetMagazine.season || "2024",
      issue: `العدد ${attrs.issue_number || targetMagazine.issue_number || 'الحالي'}`,
      description: attrs.description || "مجلة متخصصة في الأعمال والتكنولوجيا",
      coverImage: targetMagazine.image || "/maCover.jpg",
      
      mainArticle: {
        title: attrs.title || targetMagazine.title || "المقال الرئيسي",
        description: attrs.description || "وصف المقال الرئيسي لهذا العدد من المجلة",
        image: targetMagazine.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        imageAlt: "صورة المقال الرئيسي"
      },
      
      sideArticles: [
        ...otherMagazines.slice(0, 2).map((mag: any) => ({
          title: mag.title || "مقال جانبي",
          description: "مقال مميز من أعداد سابقة للمجلة",
          image: mag.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600",
          imageAlt: "صورة مقال جانبي"
        })),
        ...relatedArticles.slice(0, 2).map((article: any) => {
          const articleAttrs = article.attributes || article;
          return {
            title: articleAttrs.title || "مقال جانبي",
            description: articleAttrs.excerpt || articleAttrs.description || "وصف مقال جانبي",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600",
            imageAlt: "صورة مقال"
          };
        })
      ].slice(0, 4),
      
      galleryImages: [
        {
          image: "https://images.unsplash.com/photo-1578662996442-b9e64c5edf1f?w=600",
          imageAlt: "معرض صور المجلة"
        },
        {
          image: "https://images.unsplash.com/photo-1571115764229-c9b7b1c7d6e4?w=600",
          imageAlt: "صور من وراء الكواليس"
        }
      ],
      
      latestNews: {
        title: "آخر الأخبار والمقالات",
        items: [
          ...otherMagazines.slice(0, 2).map((mag: any) => ({
            category: "عدد سابق",
            title: mag.title || "خبر من المجلة",
            description: `تصفح ${mag.title} من ${mag.season}`,
            image: mag.image || "https://images.unsplash.com/photo-1580741569-2e86149013a1?w=800",
            imageAlt: "صورة الخبر"
          })),
          ...relatedArticles.slice(0, 1).map((article: any) => {
            const articleAttrs = article.attributes || article;
            return {
              category: "مقال",
              title: articleAttrs.title || "مقال جديد",
              description: articleAttrs.excerpt || articleAttrs.description || "اقرأ هذا المقال المميز",
              image: "https://images.unsplash.com/photo-1580741569-2e86149013a1?w=800",
              imageAlt: "صورة المقال"
            };
          })
        ].slice(0, 3)
      }
    };
    
    console.log('=== getMagazineBySlug: Final result ===', result);
    return result;
    
  } catch (error) {
    console.error('=== getMagazineBySlug: ERROR ===', error);
    return null;
  }
}