import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContentRenderer } from '@/components/blocks/content/ContentRenderer';
import { getArticleWithFullPopulation, getRelatedArticles } from '@/lib/strapi-client';
import { getStrapiMedia } from '@/components/custom/strapi-image';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Fetch article data with full population
async function getArticleData(slug: string): Promise<Article | null> {
  try {
    const article = await getArticleWithFullPopulation(slug);
    return article as Article | null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Fetch related articles
async function getRelatedArticlesData(articleId: string, categorySlug: string): Promise<Article[]> {
  try {
    const relatedResponse = await getRelatedArticles(articleId, categorySlug, 3);
    return (relatedResponse?.data || []) as Article[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

// Author component
function ArticleAuthor({ author }: { author: Article['author'] }) {
  if (!author) return null;

  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse">
      {author.avatar && (
        <div className="flex-shrink-0">
          <Image
            src={getStrapiMedia(author.avatar.url) || ''}
            alt={author.avatar.alternativeText || author.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {author.name}
        </p>
        {(author.jobTitle || author.organization) && (
          <p className="text-sm text-gray-600">
            {[author.jobTitle, author.organization].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
}

// Article metadata component
function ArticleMetadata({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
      <time dateTime={article.publish_date} className="flex items-center">
        <span>{formatDate(article.publish_date)}</span>
      </time>

      {article.category && (
        <>
          <span className="text-gray-400">•</span>
          <Link
            href={`/categories/${article.category.slug}`}
            className="text-black hover:underline font-medium"
          >
            {article.category.name}
          </Link>
        </>
      )}

      {article.is_featured && (
        <>
          <span className="text-gray-400">•</span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            مميز
          </span>
        </>
      )}
    </div>
  );
}

// Related articles component
function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <aside className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">مقالات ذات صلة</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block"
          >
            <article className="space-y-4">
              {article.cover_image && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <Image
                    src={getStrapiMedia(article.cover_image.url) || ''}
                    alt={article.cover_image.alternativeText || article.title}
                    width={article.cover_image.width || 400}
                    height={article.cover_image.height || 225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 group-hover:text-gray-700 line-clamp-2">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <time className="text-xs text-gray-500">
                  {formatDate(article.publish_date)}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </aside>
  );
}

// Magazine issues component (if article is featured in magazine)
function MagazineIssues({ issues }: { issues: Article['magazine_issues'] }) {
  if (!issues?.length) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        هذا المقال متوفر في أعداد المجلة
      </h3>
      <div className="space-y-3">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={`/magazine/${issue.slug}`}
            className="flex items-center space-x-3 rtl:space-x-reverse hover:bg-gray-100 p-2 rounded transition-colors"
          >
            {issue.cover_image && (
              <Image
                src={getStrapiMedia(issue.cover_image.url) || ''}
                alt={issue.cover_image.alternativeText || issue.title}
                width={40}
                height={56}
                className="object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{issue.title}</p>
              <p className="text-sm text-gray-600">
                العدد {issue.issue_number} • {formatDate(issue.publish_date)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleData(slug);

  if (!article) {
    notFound();
  }

  // Fetch related articles if category exists
  const relatedArticles = article.category
    ? await getRelatedArticlesData(article.documentId, article.category.slug)
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  الرئيسية
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/articles" className="hover:text-gray-900">
                  المقالات
                </Link>
              </li>
              {article.category && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <Link
                      href={`/categories/${article.category.slug}`}
                      className="hover:text-gray-900"
                    >
                      {article.category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Article Title and Meta */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {article.description}
              </p>
            )}

            <ArticleMetadata article={article} />

            {article.author && (
              <ArticleAuthor author={article.author} />
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.cover_image && (
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <Image
              src={getStrapiMedia(article.cover_image.url) || ''}
              alt={article.cover_image.alternativeText || article.title}
              width={article.cover_image.width || 1200}
              height={article.cover_image.height || 675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6">
        {article.blocks && article.blocks.length > 0 ? (
          <ContentRenderer blocks={article.blocks} />
        ) : (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 text-center py-8">
              لا يوجد محتوى متاح لهذا المقال.
            </p>
          </div>
        )}

        {/* Magazine Issues */}
        <MagazineIssues issues={article.magazine_issues} />

        {/* Related Articles */}
        <RelatedArticles articles={relatedArticles} />
      </main>

      {/* Structured Data for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description,
            "image": article.cover_image ? getStrapiMedia(article.cover_image.url) : undefined,
            "datePublished": article.publish_date,
            "dateModified": article.updatedAt,
            "author": article.author ? {
              "@type": "Person",
              "name": article.author.name,
              "jobTitle": article.author.jobTitle,
              "worksFor": article.author.organization ? {
                "@type": "Organization",
                "name": article.author.organization
              } : undefined
            } : undefined,
            "publisher": {
              "@type": "Organization",
              "name": "شروع",
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`
            },
            "articleSection": article.category?.name,
            "keywords": article.SEO?.meta_keywords,
            "wordCount": article.blocks?.reduce((count, block) => {
              if (block.__component === 'content.rich-text') {
                return count + (block.content?.split(' ').length || 0);
              }
              return count;
            }, 0),
            "inLanguage": "ar"
          })
        }}
      />
    </div>
  );
}