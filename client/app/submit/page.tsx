"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { submitArticle, checkEmail, type SubmissionData, type EmailCheckResult } from '@/app/actions/submit-new';
import ArabicMarkdownEditor from '@/components/custom/ArabicMarkdownEditor';
import BlocksEditor from '@/components/custom/BlocksEditor';
import type { SubmitPageData } from '@/lib/strapi-optimized';
import {
  FileText,
  User,
  Mail,
  Building,
  Link,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Phone,
  Globe,
  ArrowRight
} from 'lucide-react';

interface ContentBlock {
  id: string;
  __component: string;
  [key: string]: any;
}

interface RichTextBlock extends ContentBlock {
  __component: 'content.rich-text';
  content: string;
}

interface ImageBlock extends ContentBlock {
  __component: 'content.image';
  image: File | null;
  caption?: string;
  alt_text: string;
  width: 'small' | 'medium' | 'large' | 'full';
}

interface QuoteBlock extends ContentBlock {
  __component: 'content.quote';
  quote_text: string;
  author?: string;
  author_title?: string;
  style: 'default' | 'highlighted' | 'pullquote';
}

interface VideoEmbedBlock extends ContentBlock {
  __component: 'content.video-embed';
  video_url: string;
  title?: string;
  description?: string;
  thumbnail?: File | null;
  autoplay: boolean;
}

type BlockType = RichTextBlock | ImageBlock;

interface SubmissionFormData {
  // Author Information
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  authorTitle: string;
  authorOrganization: string;
  authorLinkedIn: string;
  authorBio: string;

  // Article Information
  articleTitle: string;
  articleDescription: string;
  blocks: BlockType[]; // Changed from articleContent to blocks
  publishDate: string;

  // Media
  coverImage: File | null;

  // Additional Info
  previousPublications: string;
  websiteUrl: string;
  socialMediaLinks: string;
  additionalNotes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SubmitPage() {
  // Submit page content from Strapi
  const [submitPageContent, setSubmitPageContent] = useState<SubmitPageData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string>('');

  const [currentStep, setCurrentStep] = useState(0); // Start with 0 for email check
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
  const [emailToCheck, setEmailToCheck] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [authorData, setAuthorData] = useState<any>(null);
  const [submissionInProgress, setSubmissionInProgress] = useState(false); // Prevent double submission

  const [formData, setFormData] = useState<SubmissionFormData>({
    authorName: '',
    authorEmail: '',
    authorPhone: '',
    authorTitle: '',
    authorOrganization: '',
    authorLinkedIn: '',
    authorBio: '',
    articleTitle: '',
    articleDescription: '',
    blocks: [{
      id: 'block-1',
      __component: 'content.rich-text',
      content: ''
    }], // Start with one rich text block
    publishDate: '',
    coverImage: null,
    previousPublications: '',
    websiteUrl: '',
    socialMediaLinks: '',
    additionalNotes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submissionId, setSubmissionId] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch submit page content from Strapi
  useEffect(() => {
    const fetchSubmitPageContent = async () => {
      try {
        setIsLoadingContent(true);
        const response = await fetch('/api/submit-page-content');
        if (response.ok) {
          const data = await response.json();
          setSubmitPageContent(data.data);
        } else {
          console.error('Failed to fetch submit page content');
          setContentError('فشل في تحميل محتوى الصفحة');
        }
      } catch (error) {
        console.error('Error fetching submit page content:', error);
        setContentError('خطأ في تحميل محتوى الصفحة');
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchSubmitPageContent();
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        if (response.ok) {
          const data = await response.json();
          console.log('Auth verification response:', data);
          if (data.isAuthenticated) {
            setIsLoggedIn(true);
            setUserData(data.user);
            setAuthorData(data.author);

            console.log('User data:', data.user);
            console.log('Author data:', data.author);

            // Pre-fill form with author data if available, otherwise use user data
            const sourceData = data.author || data.user;
            if (sourceData) {
              console.log('Using source data for form:', sourceData);
              console.log('Setting form data...');

              // Handle Strapi data structure (author data comes nested in attributes)
              const authorAttributes = data.author?.attributes;
              const authorData = data.author;
              const userData = data.user;

              console.log('Author attributes:', authorAttributes);
              console.log('Author data (flat):', authorData);
              console.log('User data:', userData);

              setFormData(prev => {
                const newFormData = {
                  ...prev,
                  // Try different possible data structures
                  authorName: authorAttributes?.name || authorData?.name || userData?.name || userData?.username || '',
                  authorEmail: authorAttributes?.email || authorData?.email || userData?.email || '',
                  authorPhone: authorAttributes?.phone_number || authorData?.phone_number || userData?.phone_number || '',
                  authorTitle: authorAttributes?.jobTitle || authorData?.jobTitle || userData?.jobTitle || '',
                  authorOrganization: authorAttributes?.organization || authorData?.organization || userData?.organization || '',
                  authorLinkedIn: authorAttributes?.linkedin_url || authorData?.linkedin_url || userData?.linkedin_url || '',
                  authorBio: authorAttributes?.bio || authorData?.bio || userData?.bio || ''
                };
                console.log('New form data after update:', newFormData);
                return newFormData;
              });
            } else {
              console.log('No source data available');
            }

            // Skip email step and go directly to author info
            setCurrentStep(1);
          }
        }
      } catch (error) {
        console.log('User not logged in');
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleEmailCheck = async () => {
    if (!emailToCheck) {
      setEmailCheckError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!validateEmail(emailToCheck)) {
      setEmailCheckError('تنسيق البريد الإلكتروني غير صحيح');
      return;
    }

    setIsCheckingEmail(true);
    setEmailCheckError('');

    try {
      const result = await checkEmail(emailToCheck);
      console.log('Email check result:', result); // Debug log
      setEmailCheckResult(result);

      if (result.exists && result.authorData) {
        console.log('Author data found, populating form:', result.authorData); // Debug log
        // Pre-fill form with existing author data (with sanitization)
        setFormData(prev => ({
          ...prev,
          authorName: sanitizeInput(result.authorData?.name || ''),
          authorEmail: sanitizeInput(result.authorData?.email || emailToCheck),
          authorPhone: sanitizeInput(result.authorData?.phone_number || ''),
          authorTitle: sanitizeInput(result.authorData?.jobTitle || ''),
          authorOrganization: sanitizeInput(result.authorData?.organization || ''),
          authorLinkedIn: sanitizeInput(result.authorData?.linkedin_url || ''),
          authorBio: sanitizeInput(result.authorData?.bio || ''),
          previousPublications: sanitizeInput(result.authorData?.previousPublications || ''),
          websiteUrl: sanitizeInput(result.authorData?.websiteUrl || ''),
          socialMediaLinks: sanitizeInput(result.authorData?.socialMediaLinks || ''),
          additionalNotes: sanitizeInput(result.authorData?.additionalNotes || '')
        }));
        console.log('Form data updated'); // Debug log
      } else {
        console.log('No author data found, setting email only'); // Debug log
        // Set email for new user (with sanitization)
        setFormData(prev => ({
          ...prev,
          authorEmail: sanitizeInput(emailToCheck)
        }));
      }

      setCurrentStep(1); // Move to author info step
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckError('حدث خطأ أثناء التحقق من البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Input sanitization function
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 2000); // Limit length
  };

  // Enhanced email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  };

  // URL validation
  const validateURL = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Phone number validation (international format)
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Helper functions to get validation messages and settings from Strapi content
  const getValidationMessage = (key: string, fallback: string): string => {
    if (!submitPageContent?.validationMessages) return fallback;

    const keys = key.split('.');
    let value = submitPageContent.validationMessages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }

    return typeof value === 'string' ? value : fallback;
  };

  const getSystemMessage = (key: string, fallback: string): string => {
    if (!submitPageContent?.systemMessages) return fallback;

    const message = submitPageContent.systemMessages[key];
    return typeof message === 'string' ? message : fallback;
  };

  const getMinWordCount = (): number => {
    return submitPageContent?.minWordCount || 50;
  };

  const getMaxWordCount = (): number => {
    return submitPageContent?.maxWordCount || 5000;
  };

  const getMaxFileSize = (): number => {
    return submitPageContent?.maxFileSize || 5;
  };

  const getAllowedFileTypes = (): string[] => {
    const types = submitPageContent?.allowedFileTypes || 'jpg,jpeg,png,webp';
    return types.split(',').map(type => type.trim());
  };

  // Enhanced word count validation with better space handling for Arabic and English
  const getWordCount = (text: string): number => {
    if (!text) return 0;

    // Don't trim the text to preserve trailing spaces during typing
    return text
      .replace(/[#*`_~\[\]()]/g, '') // Remove markdown symbols
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim() // Remove leading/trailing spaces for accurate counting
      .split(/\s+/) // Split by any whitespace characters
      .filter(word => {
        // Only count meaningful words (support Arabic, English, numbers)
        return word.length > 0 &&
               /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w]/.test(word); // Arabic ranges + word characters
      })
      .length;
  };

  // Helper function to get total word count from all blocks
  const getTotalWordCount = (): number => {
    return formData.blocks.reduce((total, block) => {
      if (block.__component === 'content.rich-text') {
        return total + getWordCount((block as RichTextBlock).content);
      }
      return total;
    }, 0);
  };

  // Helper function to extract text content from blocks for word counting
  const getBlocksTextContent = (blocks: BlockType[]): string => {
    return blocks.map(block => {
      if (block.__component === 'content.rich-text') {
        return (block as RichTextBlock).content;
      }
      return '';
    }).join(' ');
  };

  // Handle blocks change
  const handleBlocksChange = (blocks: BlockType[]) => {
    setFormData(prev => ({ ...prev, blocks }));

    // Clear errors when user makes changes
    if (errors.blocks) {
      setErrors(prev => ({ ...prev, blocks: '' }));
    }
  };

  // Helper function to generate unique block ID
  const generateBlockId = (): string => {
    return 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  // Helper function to add a new block
  const addBlock = (type: string) => {
    let newBlock: BlockType;

    switch (type) {
      case 'content.rich-text':
        newBlock = {
          id: generateBlockId(),
          __component: 'content.rich-text',
          content: ''
        } as RichTextBlock;
        break;
      case 'content.image':
        newBlock = {
          id: generateBlockId(),
          __component: 'content.image',
          image: null,
          caption: '',
          alt_text: '',
          width: 'medium'
        } as ImageBlock;
        break;
      case 'content.image':
        newBlock = {
          id: generateBlockId(),
          __component: 'content.image',
          image: null,
          caption: '',
          alt_text: '',
          width: 'medium'
        } as ImageBlock;
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  // Helper function to update a block
  const updateBlock = (blockId: string, updates: Partial<BlockType>) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId
          ? { ...block, ...updates } as BlockType
          : block
      )
    }));
  };

  // Helper function to remove a block
  const removeBlock = (blockId: string) => {
    if (formData.blocks.length <= 1) return; // Keep at least one block

    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  // Helper function to move block up/down
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.blocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formData.blocks.length) return;

    const newBlocks = [...formData.blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];

    setFormData(prev => ({
      ...prev,
      blocks: newBlocks
    }));
  };

  const handleInputChange = (field: keyof SubmissionFormData, value: string) => {
    // Don't sanitize during typing to preserve spaces - only sanitize during validation
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (field: 'coverImage', file: File | null) => {
    if (file) {
      // Get dynamic file size limit
      const maxSizeMB = getMaxFileSize();
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        const message = getValidationMessage('file.fileTooLarge', `حجم الصورة كبير جداً (الحد الأقصى ${maxSizeMB} ميجابايت)`)
          .replace('{max}', maxSizeMB.toString());
        setErrors(prev => ({ ...prev, coverImage: message }));
        return;
      }

      // Get dynamic allowed file types
      const allowedTypes = getAllowedFileTypes();
      const allowedMimeTypes = allowedTypes.map(type => {
        switch (type.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'webp':
            return 'image/webp';
          default:
            return `image/${type}`;
        }
      });

      if (!allowedMimeTypes.includes(file.type)) {
        const message = getValidationMessage('file.fileTypeNotSupported', `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`)
          .replace('{types}', allowedTypes.join(', '));
        setErrors(prev => ({ ...prev, coverImage: message }));
        return;
      }

      // Clear any previous errors
      if (errors.coverImage) {
        setErrors(prev => ({ ...prev, coverImage: '' }));
      }
    }

    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Author information validation
      if (!formData.authorName || formData.authorName.length < 2) {
        newErrors.authorName = getValidationMessage('author.nameMinLength', 'الاسم يجب أن يكون على الأقل حرفين');
      } else if (formData.authorName.length > 100) {
        newErrors.authorName = getValidationMessage('author.nameMaxLength', 'الاسم طويل جداً (الحد الأقصى 100 حرف)');
      }

      if (!formData.authorEmail) {
        newErrors.authorEmail = getValidationMessage('author.emailRequired', 'البريد الإلكتروني مطلوب');
      } else if (!validateEmail(formData.authorEmail)) {
        newErrors.authorEmail = getValidationMessage('author.emailInvalid', 'تنسيق البريد الإلكتروني غير صحيح');
      }

      if (!formData.authorTitle || formData.authorTitle.length < 2) {
        newErrors.authorTitle = getValidationMessage('author.titleRequired', 'المسمى الوظيفي مطلوب (على الأقل حرفين)');
      } else if (formData.authorTitle.length > 100) {
        newErrors.authorTitle = getValidationMessage('author.titleMaxLength', 'المسمى الوظيفي طويل جداً (الحد الأقصى 100 حرف)');
      }

      if (!formData.authorOrganization || formData.authorOrganization.length < 2) {
        newErrors.authorOrganization = getValidationMessage('author.organizationRequired', 'المؤسسة مطلوبة (على الأقل حرفين)');
      } else if (formData.authorOrganization.length > 100) {
        newErrors.authorOrganization = getValidationMessage('author.organizationMaxLength', 'اسم المؤسسة طويل جداً (الحد الأقصى 100 حرف)');
      }

      // Optional field validations
      if (formData.authorPhone && !validatePhone(formData.authorPhone)) {
        newErrors.authorPhone = getValidationMessage('author.phoneInvalid', 'تنسيق رقم الهاتف غير صحيح');
      }

      if (formData.authorLinkedIn && !validateURL(formData.authorLinkedIn)) {
        newErrors.authorLinkedIn = getValidationMessage('author.linkedinInvalid', 'رابط LinkedIn غير صحيح');
      }

      if (formData.authorBio && formData.authorBio.length > 1000) {
        newErrors.authorBio = getValidationMessage('author.bioMaxLength', 'النبذة طويلة جداً (الحد الأقصى 1000 حرف)');
      }

    } else if (step === 2) {
      // Article information validation
      if (!formData.articleTitle || formData.articleTitle.length < 5) {
        newErrors.articleTitle = getValidationMessage('article.titleRequired', 'عنوان المقال مطلوب (على الأقل 5 أحرف)');
      } else if (formData.articleTitle.length > 200) {
        newErrors.articleTitle = getValidationMessage('article.titleMaxLength', 'عنوان المقال طويل جداً (الحد الأقصى 200 حرف)');
      }

      if (!formData.articleDescription || formData.articleDescription.length < 20) {
        newErrors.articleDescription = getValidationMessage('article.descriptionRequired', 'وصف المقال مطلوب (على الأقل 20 حرف)');
      } else if (formData.articleDescription.length > 500) {
        newErrors.articleDescription = getValidationMessage('article.descriptionMaxLength', 'وصف المقال طويل جداً (الحد الأقصى 500 حرف)');
      }

      if (!formData.blocks || formData.blocks.length === 0) {
        newErrors.blocks = getValidationMessage('article.contentRequired', 'محتوى المقال مطلوب');
      } else {
        const wordCount = getTotalWordCount();
        const minWords = getMinWordCount();
        const maxWords = getMaxWordCount();

        if (wordCount < minWords) {
          const message = getValidationMessage('article.contentMinWords', `محتوى المقال قصير جداً ({count} كلمة، الحد الأدنى {min} كلمة)`)
            .replace('{count}', wordCount.toString())
            .replace('{min}', minWords.toString());
          newErrors.blocks = message;
        } else if (wordCount > maxWords) {
          const message = getValidationMessage('article.contentMaxWords', `محتوى المقال طويل جداً ({count} كلمة، الحد الأقصى {max} كلمة)`)
            .replace('{count}', wordCount.toString())
            .replace('{max}', maxWords.toString());
          newErrors.blocks = message;
        }
      }

    } else if (step === 3) {
      // Final step validation
      if (!termsAccepted) {
        newErrors.terms = getValidationMessage('terms.mustAccept', 'يجب الموافقة على الشروط والأحكام');
      }

      // Optional field validations for step 3
      if (formData.websiteUrl && !validateURL(formData.websiteUrl)) {
        newErrors.websiteUrl = 'رابط الموقع غير صحيح';
      }

      if (formData.previousPublications && formData.previousPublications.length > 1000) {
        newErrors.previousPublications = 'المنشورات السابقة طويلة جداً (الحد الأقصى 1000 حرف)';
      }

      if (formData.socialMediaLinks && formData.socialMediaLinks.length > 500) {
        newErrors.socialMediaLinks = 'روابط وسائل التواصل طويلة جداً (الحد الأقصى 500 حرف)';
      }

      if (formData.additionalNotes && formData.additionalNotes.length > 1000) {
        newErrors.additionalNotes = 'الملاحظات الإضافية طويلة جداً (الحد الأقصى 1000 حرف)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (submissionInProgress || isLoading) {
      return;
    }

    // Validate all required steps before submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      console.log('Form validation failed');
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Form validation passed, starting submission...');
    setSubmissionInProgress(true);
    setIsLoading(true);
    setSubmitError('');

    try {
      // Final validation and sanitization before submission
      const submissionData: SubmissionData = {
        authorName: sanitizeInput(formData.authorName),
        authorEmail: sanitizeInput(formData.authorEmail),
        authorPhone: sanitizeInput(formData.authorPhone),
        authorTitle: sanitizeInput(formData.authorTitle),
        authorOrganization: sanitizeInput(formData.authorOrganization),
        authorLinkedIn: sanitizeInput(formData.authorLinkedIn),
        authorBio: sanitizeInput(formData.authorBio),
        articleTitle: sanitizeInput(formData.articleTitle),
        articleDescription: sanitizeInput(formData.articleDescription),
        blocks: formData.blocks, // Send dynamic blocks instead of single content
        publishDate: formData.publishDate,
        coverImage: formData.coverImage, // Include cover image
        previousPublications: sanitizeInput(formData.previousPublications),
        websiteUrl: sanitizeInput(formData.websiteUrl),
        socialMediaLinks: sanitizeInput(formData.socialMediaLinks),
        additionalNotes: sanitizeInput(formData.additionalNotes),
      };

      // Validate critical fields one more time
      if (!validateEmail(submissionData.authorEmail)) {
        throw new Error(getValidationMessage('email.invalid', 'البريد الإلكتروني غير صحيح'));
      }

      const minWords = getMinWordCount();
      if (getWordCount(getBlocksTextContent(submissionData.blocks)) < minWords) {
        throw new Error(getValidationMessage('article.contentMinWords', `محتوى المقال قصير جداً (الحد الأدنى ${minWords} كلمة)`)
          .replace('{min}', minWords.toString()));
      }

      const result = await submitArticle(submissionData);
      console.log('Submit result:', result);

      if (result.success) {
        console.log('Submission successful, setting success state');
        setSubmissionId(result.submissionId || '');
        setIsSubmitted(true);

        // Clear form data for security
        setFormData({
          authorName: '',
          authorEmail: '',
          authorPhone: '',
          authorTitle: '',
          authorOrganization: '',
          authorLinkedIn: '',
          authorBio: '',
          articleTitle: '',
          articleDescription: '',
          blocks: [{
            id: 'block-1',
            __component: 'content.rich-text',
            content: ''
          }], // Reset to one empty rich text block
          publishDate: '',
          coverImage: null,
          previousPublications: '',
          websiteUrl: '',
          socialMediaLinks: '',
          additionalNotes: ''
        });
      } else {
        console.log('Submission failed:', result);
        if (result.field) {
          setErrors({ [result.field]: result.error || 'خطأ في الحقل' });
          // Scroll to error field
          const element = document.querySelector(`[name="${result.field}"], #${result.field}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          setSubmitError(result.error || 'حدث خطأ أثناء الإرسال');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      console.log('Submission process completed, setting loading to false');
      setIsLoading(false);
      setSubmissionInProgress(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-8" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 animate-ping"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">تم حفظ المقال بنجاح!</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              شكراً لك على مشاركة خبرتك معنا. تم حفظ مقالك كمسودة وسيقوم فريق التحرير بمراجعته ونشره بعد الموافقة عليه.
            </p>
            {submissionId && (
              <p className="text-sm text-gray-500 mb-8">
                رقم المرجع: <span className="font-mono font-semibold">{submissionId}</span>
              </p>
            )}

            <div className="bg-gray-50 p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">الخطوات التالية:</h3>
              <div className="space-y-3 text-sm text-gray-600 text-right">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 ml-3"></div>
                  <span>تم حفظ المقال كمسودة في النظام</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 ml-3"></div>
                  <span>مراجعة المحتوى من قبل فريق التحرير</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 ml-3"></div>
                  <span>نشر المقال بعد الموافقة عليه</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 text-base transition-all duration-200 transform hover:scale-105"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoadingContent && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black mb-6">
              <FileText className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {getSystemMessage('loading', 'جاري التحميل...')}
            </h2>
            <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-black animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoadingContent && contentError && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 mb-6 rounded-full">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">خطأ في التحميل</h2>
            <p className="text-gray-600 mb-6">{contentError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Main Content */}
        {!isLoadingContent && !contentError && submitPageContent && (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black mb-6">
                {submitPageContent.headerIcon ? (
                  <img
                    src={submitPageContent.headerIcon.url}
                    alt={submitPageContent.headerIcon.alternativeText || 'Submit icon'}
                    className="w-10 h-10"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-white" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {submitPageContent.pageTitle || 'شارك خبرتك معنا'}
              </h1>
              <div
                className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: submitPageContent.pageSubtitle ||
                    'انضم إلى مجتمع الكتّاب والخبراء في شروع وشارك معرفتك مع آلاف القراء المهتمين'
                }}
              />
            </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="grid grid-cols-7 gap-0 items-center max-w-lg">
              {/* Step 0: Email Check */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold ${
                    currentStep >= 0
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-3 text-center ${
                  currentStep >= 0 ? 'text-black font-semibold' : 'text-gray-600'
                }`}>
                  البريد الإلكتروني
                </span>
              </div>

              {/* Line 0 */}
              <div className={`h-0.5 w-full ${currentStep > 0 ? 'bg-black' : 'bg-gray-300'}`} />

              {/* Step 1: Author Info */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold ${
                    currentStep >= 1
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  1
                </div>
                <span className={`text-xs mt-3 text-center ${
                  currentStep >= 1 ? 'text-black font-semibold' : 'text-gray-600'
                }`}>
                  {submitPageContent?.authorStepTitle || 'معلومات الكاتب'}
                </span>
              </div>

              {/* Line 1 */}
              <div className={`h-0.5 w-full ${currentStep > 1 ? 'bg-black' : 'bg-gray-300'}`} />

              {/* Step 2: Article Details */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold ${
                    currentStep >= 2
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  2
                </div>
                <span className={`text-xs mt-3 text-center ${
                  currentStep >= 2 ? 'text-black font-semibold' : 'text-gray-600'
                }`}>
                  {submitPageContent?.articleStepTitle || 'تفاصيل المقال'}
                </span>
              </div>

              {/* Line 2 */}
              <div className={`h-0.5 w-full ${currentStep > 2 ? 'bg-black' : 'bg-gray-300'}`} />

              {/* Step 3: Review */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold ${
                    currentStep >= 3
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  3
                </div>
                <span className={`text-xs mt-3 text-center ${
                  currentStep >= 3 ? 'text-black font-semibold' : 'text-gray-600'
                }`}>
                  {submitPageContent?.reviewStepTitle || 'مراجعة وإرسال'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white p-8 lg:p-12" style={{ border: '1px solid #e5e7eb' }}>
          {/* Step 0: Email Check */}
          {currentStep === 0 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {submitPageContent?.emailStepTitle || 'تحقق من البريد الإلكتروني'}
                </h2>
                <p className="text-gray-600">
                  {submitPageContent?.emailStepDescription || 'أدخل بريدك الإلكتروني للتحقق من وجود حساب مرتبط به'}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني *</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={emailToCheck}
                      onChange={(e) => {
                        setEmailToCheck(e.target.value);
                        setEmailCheckError('');
                      }}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        emailCheckError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="أدخل بريدك الإلكتروني"
                      disabled={isCheckingEmail}
                    />
                  </div>
                  {emailCheckError && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {emailCheckError}
                    </p>
                  )}
                </div>

                {emailCheckResult && (
                  <div className={`p-4 rounded-lg ${
                    emailCheckResult.exists
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    {emailCheckResult.exists ? (
                      <div className="text-blue-800">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 ml-2" />
                          <span className="font-semibold">تم العثور على حساب مرتبط بهذا البريد الإلكتروني</span>
                        </div>
                        {emailCheckResult.authorData ? (
                          <p className="text-sm">سيتم تعبئة معلومات الكاتب تلقائياً من حسابك المحفوظ.</p>
                        ) : (
                          <p className="text-sm">يرجى تسجيل الدخول أو إكمال معلومات الكاتب.</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-green-800">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 ml-2" />
                          <span className="font-semibold">بريد إلكتروني جديد</span>
                        </div>
                        <p className="text-sm">سيتم إنشاء حساب جديد لك تلقائياً عند إرسال المقال.</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleEmailCheck}
                  disabled={isCheckingEmail || !emailToCheck}
                  className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 px-8 text-base transition-all duration-200 flex items-center justify-center"
                >
                  {isCheckingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      جارٍ التحقق...
                    </>
                  ) : (
                    <>
                      المتابعة
                      <ArrowRight className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Author Information */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {submitPageContent?.authorStepTitle || 'معلومات الكاتب'}
                </h2>
                <p className="text-gray-600">
                  {isLoggedIn
                    ? (authorData
                        ? 'مرحباً بك! تم تعبئة معلوماتك تلقائياً من ملفك الشخصي'
                        : 'مرحباً بك! يرجى إكمال معلومات الكاتب')
                    : 'نحتاج لمعرفة من أنت وخلفيتك المهنية'
                  }
                </p>
                {isLoggedIn && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center text-green-700">
                      <CheckCircle className="w-4 h-4 ml-2" />
                      <span className="text-sm">
                        {authorData
                          ? 'تم تسجيل الدخول بنجاح وتم العثور على بيانات الكاتب'
                          : 'تم تسجيل الدخول بنجاح'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Author Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">الاسم الكامل *</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={(e) => handleInputChange('authorName', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorName ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  {errors.authorName && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorName}
                    </p>
                  )}
                </div>

                {/* Author Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني *</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="authorEmail"
                      value={formData.authorEmail}
                      onChange={(e) => handleInputChange('authorEmail', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorEmail ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="example@domain.com"
                    />
                  </div>
                  {errors.authorEmail && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorEmail}
                    </p>
                  )}
                </div>

                {/* Author Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">رقم الهاتف</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      name="authorPhone"
                      value={formData.authorPhone}
                      onChange={(e) => handleInputChange('authorPhone', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorPhone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                  {errors.authorPhone && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorPhone}
                    </p>
                  )}
                </div>

                {/* Author Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">المسمى الوظيفي *</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="authorTitle"
                      value={formData.authorTitle}
                      onChange={(e) => handleInputChange('authorTitle', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorTitle ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="مثال: مدير التطوير التقني"
                    />
                  </div>
                  {errors.authorTitle && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorTitle}
                    </p>
                  )}
                </div>

                {/* Author Organization */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">اسم المؤسسة *</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="authorOrganization"
                      value={formData.authorOrganization}
                      onChange={(e) => handleInputChange('authorOrganization', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorOrganization ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="اسم الشركة أو المؤسسة"
                    />
                  </div>
                  {errors.authorOrganization && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorOrganization}
                    </p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">رابط LinkedIn</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Link className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      name="authorLinkedIn"
                      value={formData.authorLinkedIn}
                      onChange={(e) => handleInputChange('authorLinkedIn', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.authorLinkedIn ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  {errors.authorLinkedIn && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.authorLinkedIn}
                    </p>
                  )}
                </div>
              </div>

              {/* Author Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  نبذة عن الكاتب
                  <span className="text-xs text-gray-500 mr-2">({formData.authorBio.length}/1000)</span>
                </label>
                <textarea
                  name="authorBio"
                  value={formData.authorBio}
                  onChange={(e) => handleInputChange('authorBio', e.target.value)}
                  rows={4}
                  className={`w-full p-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors.authorBio ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                  placeholder="اكتب نبذة مختصرة عن خبرتك وخلفيتك المهنية..."
                />
                {errors.authorBio && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.authorBio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Article Information */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {submitPageContent?.articleStepTitle || 'تفاصيل المقال'}
                </h2>
                <p className="text-gray-600">
                  {submitPageContent?.articleStepDescription || 'أخبرنا عن المقال الذي تريد نشره'}
                </p>
              </div>

              {/* Article Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">عنوان المقال *</label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.articleTitle}
                    onChange={(e) => handleInputChange('articleTitle', e.target.value)}
                    className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors.articleTitle ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                    }`}
                    placeholder="اكتب عنواناً جذاباً ومعبراً عن محتوى المقال"
                  />
                </div>
                {errors.articleTitle && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.articleTitle}
                  </p>
                )}
              </div>

              {/* Article Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">وصف مختصر للمقال *</label>
                <textarea
                  value={formData.articleDescription}
                  onChange={(e) => handleInputChange('articleDescription', e.target.value)}
                  rows={3}
                  className={`w-full p-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors.articleDescription ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                  placeholder="اكتب وصفاً مختصراً يلخص موضوع المقال وأهم النقاط التي يغطيها..."
                />
                {errors.articleDescription && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.articleDescription}
                  </p>
                )}
              </div>

              {/* Article Content - Dynamic Blocks */}
              <div className="space-y-2">
                <BlocksEditor
                  blocks={formData.blocks}
                  onChange={handleBlocksChange}
                  errors={errors}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>يُنصح بأن يكون المقال بين 300-2000 كلمة للحصول على أفضل تجربة قراءة (الحد الأدنى 50 كلمة)</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                    عدد الكلمات: {getWordCount(getBlocksTextContent(formData.blocks))}
                  </span>
                </div>
              </div>


              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">صورة الغلاف</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">اسحب الصورة هنا أو انقر للاختيار</p>
                  <p className="text-xs text-gray-500 mb-2">الحد الأقصى: 5 ميجابايت | الأنواع المدعومة: JPG, PNG, WebP</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('coverImage', e.target.files?.[0] || null)}
                    className="hidden"
                    id="coverImage"
                  />
                  <label
                    htmlFor="coverImage"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    اختر ملف
                  </label>
                  {formData.coverImage && (
                    <p className="text-xs text-green-600 mt-2">{formData.coverImage.name}</p>
                  )}
                </div>
                {errors.coverImage && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.coverImage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {submitPageContent?.reviewStepTitle || 'معلومات إضافية'}
                </h2>
                <p className="text-gray-600">
                  {submitPageContent?.reviewStepDescription || 'معلومات اختيارية تساعدنا في تحسين جودة المحتوى'}
                </p>
              </div>

              {/* Previous Publications */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  منشورات سابقة
                  <span className="text-xs text-gray-500 mr-2">({formData.previousPublications.length}/1000)</span>
                </label>
                <textarea
                  name="previousPublications"
                  value={formData.previousPublications}
                  onChange={(e) => handleInputChange('previousPublications', e.target.value)}
                  rows={3}
                  className={`w-full p-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors.previousPublications ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                  placeholder="اذكر روابط أو أسماء منشوراتك السابقة (إن وجدت)..."
                />
                {errors.previousPublications && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.previousPublications}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Website URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">موقع الويب الشخصي</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.websiteUrl ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  {errors.websiteUrl && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.websiteUrl}
                    </p>
                  )}
                </div>

                {/* Social Media Links */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    روابط وسائل التواصل
                    <span className="text-xs text-gray-500 mr-2">({formData.socialMediaLinks.length}/500)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Link className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="socialMediaLinks"
                      value={formData.socialMediaLinks}
                      onChange={(e) => handleInputChange('socialMediaLinks', e.target.value)}
                      className={`w-full pr-12 pl-4 py-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.socialMediaLinks ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                      }`}
                      placeholder="Twitter, Instagram, etc."
                    />
                  </div>
                  {errors.socialMediaLinks && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 ml-1" />
                      {errors.socialMediaLinks}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  ملاحظات إضافية
                  <span className="text-xs text-gray-500 mr-2">({formData.additionalNotes.length}/1000)</span>
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  rows={4}
                  className={`w-full p-4 border-2 focus:outline-none focus:ring-4 focus:ring-gray-100 text-base transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors.additionalNotes ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                  placeholder="أي معلومات إضافية تريد مشاركتها معنا..."
                />
                {errors.additionalNotes && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.additionalNotes}
                  </p>
                )}
              </div>

              {/* Summary Preview */}
              <div className="bg-gray-50 p-6 border-2 border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">ملخص المقال</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">العنوان:</span> {formData.articleTitle || 'غير محدد'}</div>
                  <div><span className="font-medium">الكاتب:</span> {formData.authorName || 'غير محدد'}</div>
                  <div><span className="font-medium">عدد الكلمات:</span> {getWordCount(getBlocksTextContent(formData.blocks))}</div>
                  <div><span className="font-medium">صورة الغلاف:</span> {formData.coverImage ? 'مرفقة' : 'غير مرفقة'}</div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      // Clear error when user checks the box
                      if (errors.terms && e.target.checked) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    أوافق على <a href="#" className="text-black hover:underline">شروط النشر</a> و
                    <a href="#" className="text-black hover:underline mx-1">سياسة الخصوصية</a>.
                    أؤكد أن المحتوى المقدم أصلي ولا ينتهك حقوق الطبع والنشر لأي طرف ثالث.
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm flex items-center mt-2">
                    <AlertCircle className="w-4 h-4 ml-1" />
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit Error Display */}
              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep > 0 && (
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-8 py-3 border-2 font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                السابق
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium transition-all duration-200 transform hover:scale-105"
                >
                  التالي
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || submissionInProgress}
                  className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading || submissionInProgress ? 'جاري الإرسال...' : 'إرسال المقال'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Guidelines Section */}
        <div className="mt-12 bg-white p-8" style={{ border: '1px solid #e5e7eb' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {submitPageContent.guidelinesTitle || 'إرشادات النشر'}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">
                {submitPageContent.contentCriteriaTitle || 'معايير المحتوى'}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {submitPageContent.contentCriteriaItems && submitPageContent.contentCriteriaItems.length > 0 ? (
                  submitPageContent.contentCriteriaItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>{item.itemText}</span>
                    </li>
                  ))
                ) : (
                  // Fallback content
                  <>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>التركيز على مواضيع ذات علاقة</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>استخدام اللغة العربية الفصحى المبسطة والواضحة</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>تجنب المحتوى التجاري المباشر أو الدعاية</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>احترام حقوق الملكية الفكرية والمصادر عند الاقتباس</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>تعزيز المعرفة الهوية والإلهام القيادي في الطرح</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">
                {submitPageContent.reviewProcessTitle || 'عملية المراجعة'}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {submitPageContent.reviewProcessItems && submitPageContent.reviewProcessItems.length > 0 ? (
                  submitPageContent.reviewProcessItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>{item.itemText}</span>
                    </li>
                  ))
                ) : (
                  // Fallback content
                  <>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>مراجعة فنية وتحريرية خلال 7-5 أيام</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>قد نطلب تعديلات أو إضافات</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>إشعار بالقبول أو الرفض مع الأسباب</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 mt-2 ml-2"></div>
                      <span>النشر حسب التوقيت المناسب</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </main>
  );
}
