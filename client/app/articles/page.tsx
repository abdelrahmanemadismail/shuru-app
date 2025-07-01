'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, User, Loader2, AlertCircle, RefreshCw, Star, ArrowRight, Tag } from 'lucide-react';
import { 
  getAllArticles, 
  getFeaturedArticles,
  Article,
  getImageUrl,
  getAuthorName,
  getCategoryName,
  formatDate,
  debugStrapiSetup
} from '@/lib/strapi-client';


const ArticlesListPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    fetchAllData();
  }, []);

const fetchAllData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🚀 Starting data fetch...');
    
    // Try to get articles with simple approach
    try {
      console.log('📰 Attempting to fetch articles...');
      const articlesResponse = await getAllArticles();
      console.log('✅ Articles response:', articlesResponse);
      setArticles(articlesResponse.data || []);
      
      // Try to get featured articles
      console.log('⭐ Attempting to fetch featured articles...');
      const featuredResponse = await getFeaturedArticles();
      console.log('✅ Featured response:', featuredResponse);
      setFeaturedArticles(featuredResponse.data || []);
      
    } catch (fetchError) {
      console.error('❌ Fetch failed:', fetchError);
      
      // Fallback: use test data
      console.log('🔄 Using fallback test data...');
      const testData = [
        {
          id: 1,
          attributes: {
            title: "مقال تجريبي",
            slug: "test-article",
            excerpt: "هذا مقال تجريبي لاختبار النظام",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            is_featured: true
          }
        }
      ];
      
      setArticles(testData);
      setFeaturedArticles(testData);
      setError('تم استخدام بيانات تجريبية - تحقق من اتصال Strapi');
    }
    
  } catch (err) {
    console.error('💥 Complete failure:', err);
    const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
}
export default ArticlesListPage;