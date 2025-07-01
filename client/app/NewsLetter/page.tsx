'use client'
import React, { useState } from 'react';
import { Mail, User, Building, Briefcase, GraduationCap, Code, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { submitToNewsletterWithJobTitle } from '@/lib/strapi-client';

const NewsletterPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !name || !jobTitle) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await submitToNewsletterWithJobTitle(email, name, jobTitle);
      
      if (result.success) {
        setIsSubmitted(true);
        setEmail('');
        setName('');
        setJobTitle('');
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(result.error || 'حدث خطأ في الإرسال');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const jobTitleOptions = [
    { value: '', label: 'اختر المسمى الوظيفي *' },
    { value: 'ceo', label: 'الرئيس التنفيذي' },
    { value: 'manager', label: 'مدير' },
    { value: 'developer', label: 'مطور' },
    { value: 'designer', label: 'مصمم' },
    { value: 'student', label: 'طالب' },
    { value: 'entrepreneur', label: 'رائد أعمال' },
    { value: 'consultant', label: 'استشاري' },
    { value: 'analyst', label: 'محلل' },
    { value: 'marketer', label: 'مسوق' },
    { value: 'sales', label: 'مبيعات' },
    { value: 'hr', label: 'موارد بشرية' },
    { value: 'finance', label: 'مالية' },
    { value: 'other', label: 'أخرى' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section - More Compact */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#ff6b5a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-3 tracking-tight uppercase leading-tight">
              استكشف النشرات الإخبارية
              <br />
              للشركات السريعة
            </h1>
            <p className="text-sm sm:text-base text-white mb-8 max-w-2xl mx-auto font-normal">
              اكتشف وجهات نظر جديدة. اشترك للحصول على أهم التغطيات الإخبارية في صندوق الوارد الخاص بك.
            </p>
            
            {/* Newsletter Preview Cards - Exact Fast Company Style */}
            <div className="flex justify-center items-end gap-2 sm:gap-3 mt-6 perspective-1000">
              {[
                { name: 'COMPASS', content: ['نصائح الاستثمار', 'أفكار ريادية', 'تحليلات السوق'] },
                { name: 'CO.DESIGN', content: ['التصميم المبتكر', 'تجربة المستخدم', 'الإبداع الرقمي'] },
                { name: 'IMPACT', content: ['التأثير الاجتماعي', 'الاستدامة', 'الابتكار المسؤول'] },
                { name: 'PLUGGED IN', content: ['أخبار التكنولوجيا', 'الذكاء الاصطناعي', 'ريادة الأعمال'] },
                { name: 'MODERN CEO', content: ['القيادة الحديثة', 'استراتيجيات الأعمال', 'إدارة الفرق'] }
              ].map((newsletter, index) => (
                <div
                  key={index}
                  className={`
                    w-20 sm:w-24 lg:w-28 h-32 sm:h-36 lg:h-40 bg-white
                    transform hover:scale-105
                    ${index === 2 ? 'scale-110 z-10 -rotate-2' : ''}
                    ${index === 1 ? 'scale-105 rotate-1' : ''}
                    ${index === 3 ? 'scale-105 -rotate-1' : ''}
                    ${index === 0 ? 'rotate-2' : ''}
                    ${index === 4 ? '-rotate-2' : ''}
                  `}
                  style={{
                    transform: `
                      translateY(${index === 2 ? '0px' : index === 1 || index === 3 ? '6px' : '12px'})
                      scale(${index === 2 ? '1.1' : index === 1 || index === 3 ? '1.05' : '1'})
                      rotate(${index === 0 ? '2deg' : index === 1 ? '1deg' : index === 2 ? '-2deg' : index === 3 ? '-1deg' : '-2deg'})
                    `,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div className="p-2 h-full flex flex-col">
                    {/* Header with browser chrome */}
                    <div className="flex items-center gap-0.5 mb-2">
                      <div className="w-1.5 h-1.5 bg-red-400"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-400"></div>
                      <div className="w-1.5 h-1.5 bg-green-400"></div>
                    </div>
                    
                    {/* Newsletter name */}
                    <h3 className="font-bold text-gray-800 mb-1.5 text-xs uppercase tracking-wide">
                      {newsletter.name}
                    </h3>
                    
                    {/* Content preview */}
                    <div className="space-y-1.5 mb-2">
                      <div className="h-6 bg-gray-300"></div>
                      <div className="space-y-0.5">
                        {newsletter.content.map((item, i) => (
                          <div key={i} className="text-xs text-gray-600 truncate">{item}</div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mock content lines */}
                    <div className="mt-auto space-y-0.5">
                      <div className="h-1 bg-gray-200"></div>
                      <div className="h-1 bg-gray-200 w-4/5"></div>
                      <div className="h-1 bg-gray-200 w-3/5"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Section - Enhanced with Images */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
             {/* Left Side - Images */}
            <div className="relative hidden lg:block">
              {/* Main Image */}
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Business meeting"
                  className="w-full h-80 object-cover"
                  style={{ border: '1px solid #e5e7eb' }}
                />
                {/* Overlay Cards */}
                <div className="absolute -bottom-4 -right-4 bg-white p-4" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">+2,500</p>
                      <p className="text-xs text-gray-500">مشترك جديد</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -left-4 bg-white p-3" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-800">نمو 95%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Small images grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Working on laptop"
                  className="w-full h-24 object-cover"
                  style={{ border: '1px solid #e5e7eb' }}
                />
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Business analytics"
                  className="w-full h-24 object-cover"
                  style={{ border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative">
              {/* Mobile Image */}
              <div className="lg:hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Business meeting"
                  className="w-full h-48 object-cover"
                  style={{ border: '1px solid #e5e7eb' }}
                />
              </div>

              {isSubmitted ? (
                <div className="bg-white p-8 text-center" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="relative">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">تم الاشتراك بنجاح!</h3>
                  <p className="text-gray-600 leading-relaxed">شكراً لك. ستصلك أحدث النشرات قريباً في صندوق الوارد.</p>
                  
                  {/* Success decoration */}
                  <div className="mt-6 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400"></div>
                    <div className="w-2 h-2 bg-green-400"></div>
                    <div className="w-2 h-2 bg-green-400"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 relative overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-black mb-4">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">انضم إلى مجتمعنا</h3>
                      <p className="text-gray-600">احصل على أحدث الأخبار والتحليلات</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Name Input */}
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 text-base bg-gray-50 focus:bg-white"
                          placeholder="الاسم الكامل *"
                          required
                          style={{ border: '1px solid #e5e7eb' }}
                        />
                      </div>

                      {/* Email Input */}
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 text-base bg-gray-50 focus:bg-white"
                          placeholder="البريد الإلكتروني *"
                          required
                          style={{ border: '1px solid #e5e7eb' }}
                        />
                      </div>

                      {/* Job Title Select */}
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <select
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full pr-12 pl-10 py-4 border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 text-base bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                          required
                          style={{ border: '1px solid #e5e7eb' }}
                        >
                          {jobTitleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-full font-bold py-4 px-6 text-base uppercase tracking-wide
                          ${isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-black hover:bg-gray-800 transform hover:scale-105'
                          } text-white`}
                      >
                        {isLoading ? 'جاري الإرسال...' : 'اشترك الآن'}
                      </button>

                      {/* Privacy Notice */}
                      <div className="text-xs text-gray-500 leading-relaxed text-center bg-gray-50 p-4">
                        هذا الموقع محمي بواسطة reCAPTCHA وتطبق 
                        <a href="#" className="text-gray-800 hover:text-black mx-1 underline">سياسة الخصوصية</a>
                        و
                        <a href="#" className="text-gray-800 hover:text-black mx-1 underline">شروط الخدمة</a>
                        من Google.
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-600">محتوى حصري</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-600">أسبوعياً</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsletterPage;