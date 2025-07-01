import type { Article } from "@/lib/strapi-client";

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function getStrapiURL() {
  return process.env.STRAPI_BASE_URL ?? "http://localhost:1337";
}

export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}



export function getAuthorName(article: Article): string {
  return article.attributes.guest_author_name || 'Guest Author';
}

export function getCategoryName(article: Article): string {
  return article.attributes.category?.data?.attributes?.name || 'General';
}

export function formatStrapiDate(dateString?: string): string {
  if (!dateString) return 'No date';
  
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

export function getImageUrl(article: Article): string | null {
  if (!article.attributes.cover_image?.data?.attributes?.url) return null;
  return `${STRAPI_BASE_URL}${article.attributes.cover_image.data.attributes.url}`;
}
