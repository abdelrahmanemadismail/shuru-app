'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Loader2, 
  Share2, 
  Heart, 
  Bookmark, 
  AlertCircle, 
  RefreshCw,
  Tag,
  Star,
  Clock,
  Eye
} from 'lucide-react';
import {
  getArticleBySlug,
  Article,
  ArticleBlock
} from '@/lib/strapi-client';
import {
  getImageUrl,
  getAuthorName,
  getCategoryName,
  formatDate
} from '@/lib/utils';

interface ArticleDetailsPageProps {
  slug: string;
}

const ArticleDetailsPage = ({ slug }: ArticleDetailsPageProps) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching article with slug:', slug);
      
      const articleData = await getArticleBySlug(slug);

      if (articleData) {
        console.log('✅ Article loaded successfully:', articleData);
        setArticle(articleData);
        
        // Calculate reading time
        const content = extractTextContent(articleData.attributes.blocks);
        const wordsPerMinute = 200; // Average reading speed for Arabic
        const wordCount = content.split(/\s+/).length;
        const estimatedTime = Math.ceil(wordCount / wordsPerMinute);
        setReadingTime(estimatedTime);
      } else {
        console.log('❌ Article not found');
        setError('لم يتم العثور على المقال المطلوب');
      }
      
    } catch (err) {
      console.error('💥 Error loading article:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع في تحميل المقال';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const extractTextContent = (blocks: ArticleBlock[] | undefined): string => {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks
      .filter(block => 
        block.__component === 'blocks.rich-text' || 
        block.__component === 'content.rich-text'
      )
      .map(block => {
        // Strip HTML tags to get plain text for word count
        const text = block.content || '';
        return text.replace(/<[^>]*>/g, '');
      })
      .join(' ');
  };

  const renderContent = (blocks: ArticleBlock[] | undefined): React.ReactNode => {
    if (!blocks || !Array.isArray(blocks)) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">محتوى المقال غير متوفر</h3>
          <p className="text-yellow-700">سيتم إضافة المحتوى قريباً</p>
        </div>
      );
    }
    
    return blocks.map((block: ArticleBlock, index: number) => {
      if (
        block.__component === 'blocks.rich-text' ||
        block.__component === 'content.rich-text'
      ) {
        return (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
            className="prose prose-lg max-w-none text-right mb-8 text-gray-800 leading-relaxed prose-headings:text-gray-900 prose-headings:font-bold prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-2"
          />
        );
      }
      
      // Handle other block types if needed
      if (block.__component === 'blocks.image') {
        return (
          <div key={index} className="mb-8">
            <img 
              src={getImageUrl(block.image?.data?.attributes?.url) || ''}
              alt={block.image?.data?.attributes?.alternativeText || 'صورة المقال'}
              className="w-full rounded-lg shadow-lg"
            />
            {block.caption && (
              <p className="text-sm text-gray-600 text-center mt-2 italic">
                {block.caption}
              </p>
            )}
          </div>
        );
      }
      
      if (block.__component === 'blocks.quote') {
        return (
          <blockquote key={index} className="border-r-4 border-blue-500 pr-6 py-4 mb-8 bg-blue-50 rounded-lg">
            <p className="text-lg italic text-gray-700 mb-2">{block.content}</p>
            {block.author && (
              <cite className="text-sm text-gray-600 font-medium">— {block.author}</cite>
            )}
          </blockquote>
        );
      }
      
      return null;
    });
  };

  const handleBack = () => {
    window.location.href = '/articles';
  };

  const handleShare = async () => {
    const shareData = {
      title: article?.attributes?.title,
      text: article?.attributes?.excerpt,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ رابط المقال!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Add API call to like/unlike article
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Add API call to bookmark/unbookmark article
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">جاري تحميل المقال...</h3>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمقالات
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل المقال</h3>
            <p className="text-red-700 mb-6 text-sm">{error}</p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={fetchArticle}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </button>
              
              <button 
                onClick={handleBack}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                العودة للمقالات
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Article Not Found
  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المقال غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على المقال المطلوب</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للمقالات
          </button>
        </div>
      </div>
    );
  }

  const attrs = article.attributes;
  const coverImageUrl = getImageUrl(attrs?.cover_image?.data?.attributes?.url);
  const author = getAuthorName(article);
  const authorAvatarUrl = getImageUrl(attrs?.author?.data?.attributes?.avatar?.data?.attributes?.url);
  const category = getCategoryName(article);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors group"
        >
          <ArrowRight className="w-4 h-4 ml-2 group-hover:mr-1 transition-all" />
          العودة للمقالات
        </button>

        <article>
          {/* Header */}
          <header className="mb-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Tag className="w-3 h-3 ml-1" />
                  {category}
                </span>
              )}
              
              {attrs.is_featured && (
                <span className="inline-flex items-center bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-3 h-3 ml-1" />
                  مقال مميز
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {attrs.title}
            </h1>

            {/* Excerpt */}
            {attrs.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {attrs.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4 space-x-reverse">
                {authorAvatarUrl ? (
                  <img 
                    src={authorAvatarUrl} 
                    alt={author}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{author}</p>
                  <p className="text-sm text-gray-600">الكاتب</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 ml-1" />
                  {formatDate(attrs.publish_date || attrs.createdAt)}
                </div>
                {readingTime > 0 && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 ml-1" />
                    {readingTime} دقائق قراءة
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-6 space-x-reverse">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 space-x-reverse transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">إعجاب</span>
                </button>
                
                <button 
                  onClick={handleBookmark}
                  className={`flex items-center space-x-2 space-x-reverse transition-colors ${
                    isBookmarked ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">حفظ</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">مشاركة</span>
                </button>
              </div>

              {/* Reading Progress could be added here */}
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 ml-1" />
                <span>معاينة المقال</span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {coverImageUrl && (
            <div className="mb-12">
              <img 
                src={coverImageUrl} 
                alt={attrs.cover_image?.data?.attributes?.alternativeText || attrs.title}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {attrs.cover_image?.data?.attributes?.caption && (
                <p className="text-sm text-gray-600 text-center mt-3 italic">
                  {attrs.cover_image.data.attributes.caption}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="mb-12">
            {renderContent(attrs.blocks)}
          </div>

          {/* SEO and Meta Tags Info */}
          {attrs.SEO && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات SEO</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {attrs.SEO.meta_title && (
                  <p><strong>العنوان:</strong> {attrs.SEO.meta_title}</p>
                )}
                {attrs.SEO.meta_description && (
                  <p><strong>الوصف:</strong> {attrs.SEO.meta_description}</p>
                )}
                {attrs.SEO.meta_keywords && (
                  <p><strong>الكلمات المفتاحية:</strong> {attrs.SEO.meta_keywords}</p>
                )}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className="mt-12 p-8 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-4 space-x-reverse">
              {authorAvatarUrl ? (
                <img 
                  src={authorAvatarUrl} 
                  alt={author}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  نبذة عن {author}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {attrs?.author?.data?.attributes?.bio || 
                   `${author} كاتب متخصص يساهم في إثراء المحتوى العربي بمقالات قيمة ومفيدة.`}
                </p>
                {attrs?.author?.data?.attributes?.email && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>البريد الإلكتروني:</strong> {attrs.author.data.attributes.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">استكشف المزيد من المحتوى</h3>
            <p className="text-blue-100 mb-6">
              اكتشف مقالات أخرى مثيرة للاهتمام ومفيدة في مجالات متنوعة
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={handleBack}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                تصفح جميع المقالات
              </button>
              <button 
                onClick={() => window.location.href = '/articles?filter=featured'}
                className="bg-blue-400 text-white px-6 py-3 rounded-lg hover:bg-blue-300 transition-colors font-semibold border border-blue-300"
              >
                المقالات المميزة
              </button>
            </div>
          </div>

          {/* Article JSON-LD for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": attrs.title,
                "description": attrs.excerpt,
                "image": coverImageUrl,
                "author": {
                  "@type": "Person",
                  "name": author
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Your Site Name"
                },
                "datePublished": attrs.publish_date || attrs.createdAt,
                "dateModified": attrs.updatedAt
              })
            }}
          />

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer font-medium mb-2">معلومات تقنية</summary>
              <div className="space-y-1">
                <p>تم تحميل المقال بنجاح من Strapi • Slug: {slug}</p>
                <p>ID: {article.id} • تاريخ الإنشاء: {new Date(attrs.createdAt).toLocaleString('ar-SA')}</p>
                <p>عدد الكتل: {attrs.blocks?.length || 0} • وقت القراءة المقدر: {readingTime} دقائق</p>
                <p>حالة النشر: {attrs.publishedAt ? 'منشور' : 'مسودة'}</p>
              </div>
            </details>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailsPage;