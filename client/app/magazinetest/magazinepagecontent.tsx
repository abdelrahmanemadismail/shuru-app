"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getAllMagazines, getCurrentMagazine } from "@/lib/strapi-client"

// Types
interface MagazineArchive {
  id: string;
  title: string;
  season: string;
  image: string;
  colorBar: string;
  issue_number?: number;
}

interface CurrentMagazine {
  id: string;
  title: string;
  issue: string;
  season: string;
  coverImage: string;
}

export function MagazinePageContent() {
  const [currentMagazine, setCurrentMagazine] = useState<CurrentMagazine | null>(null);
  const [magazineArchive, setMagazineArchive] = useState<MagazineArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMagazineData() {
      try {
        setLoading(true);
        
        // Fetch current magazine and all magazines in parallel
        const [currentResponse, allMagazinesResponse] = await Promise.all([
          getCurrentMagazine(),
          getAllMagazines()
        ]);

        if (currentResponse) {
          setCurrentMagazine(currentResponse);
        }

        if (allMagazinesResponse?.data) {
          // Filter out the current magazine from archive (optional)
          const archiveData = currentResponse 
            ? allMagazinesResponse.data.filter((mag: any) => mag.id !== currentResponse.id)
            : allMagazinesResponse.data;
          
          setMagazineArchive(archiveData);
        }

        if ("error" in allMagazinesResponse && allMagazinesResponse.error) {
          setError(allMagazinesResponse.error);
        }

      } catch (err) {
        console.error('Error fetching magazine data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchMagazineData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Fallback data if no current magazine is found
  const displayCurrentMagazine = currentMagazine || {
    id: "fallback-magazine",
    title: "العدد الحالي",
    issue: "العدد الجديد",
    season: "2024",
    coverImage: "/maCover.jpg",
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Magazine Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-bold text-[28px] sm:text-[32px] md:text-[36px] uppercase leading-tight tracking-[4px] sm:tracking-[6px] text-black text-center mb-2">
          مجلة فاست كومباني
        </h1>
        <p className="text-gray-400 text-sm tracking-[2px] uppercase text-center">
          {displayCurrentMagazine.issue}، {displayCurrentMagazine.season}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Current Issue Cover */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[320px] md:max-w-[360px]">
              <Link href={`/magazine/${displayCurrentMagazine.id}`} className="group block">
                <Image
                  src={displayCurrentMagazine.coverImage}
                  alt={`غلاف مجلة فاست كومباني - ${displayCurrentMagazine.title}`}
                  width={360}
                  height={480}
                  className="w-full h-auto object-cover"
                />
              </Link>
            </div>
          </div>

          {/* Right - Subscription Section */}
          <div className="flex justify-center lg:justify-start items-center">
            <div className="relative w-full max-w-[400px] h-[280px] md:h-[320px]">
              {/* Background gradient shape */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 transform -skew-x-12 rounded-lg"></div>

              {/* Simplified Decorative Elements */}
              <div className="absolute top-6 right-8 w-12 h-12 bg-green-500 rounded-full opacity-80"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 bg-green-500 rounded-full opacity-60"></div>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-700 rounded-full"></div>

              {/* Plus Icon */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                <h2 className="font-bold text-black text-[28px] md:text-[32px] mb-3 tracking-wide">اشترك</h2>
                <p className="font-bold text-black text-[15px] md:text-[16px] tracking-[1px] uppercase">في المجلة!</p>
                <button className="mt-6 bg-black text-white px-6 py-2 rounded-none font-medium text-sm hover:bg-gray-800 uppercase tracking-wide">
                  اشترك الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t-2 border-black w-1/2 mx-auto"></div>

      {/* Magazine Archives Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-bold text-[28px] sm:text-[32px] md:text-[36px] uppercase leading-tight tracking-[4px] sm:tracking-[6px] text-black text-center mb-4">
          أرشيف مجلة فاست كومباني
        </h2>
        <p className="text-gray-400 text-sm tracking-[2px] uppercase text-center mb-12">
          تصفح أعداد المجلة السابقة
        </p>

        {magazineArchive.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {magazineArchive.map((magazine) => (
              <Link key={magazine.id} href={`/magazine/${magazine.id}`} className="group">
                <div className="text-center">
                  {/* Magazine cover image */}
                  <div className="w-full aspect-[3/4] mb-4">
                    <Image
                      src={magazine.image}
                      alt={magazine.title}
                      width={360}
                      height={480}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-black text-[16px] md:text-[18px] leading-tight mb-2 uppercase tracking-wide">
                    {magazine.title}
                  </h3>
                  <div className="text-gray-500 text-sm">
                    <span>{magazine.season}</span>
                    <span className="mx-2 text-orange-500">|</span>
                    <span className="text-orange-500 font-medium">العدد الكامل</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد أعداد متاحة حالياً</p>
          </div>
        )}
      </div>

      {/* Show More Button - Only show if there are magazines */}
      {magazineArchive.length > 0 && (
        <div className="text-center pb-16">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-none font-medium text-sm hover:bg-orange-600 uppercase tracking-wide">
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  )
}