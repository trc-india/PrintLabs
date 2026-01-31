'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
}

export default function HeroSlider({ banners, delay = 4000 }: { banners: Banner[], delay?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto Scroll Logic
  useEffect(() => {
    if (banners.length <= 1) return
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, delay)

    return () => clearInterval(timer)
  }, [banners.length, delay, isPaused])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!banners || banners.length === 0) return null

  return (
    // 👇 HEIGHT FIXED: Slim Strip Style
    <div 
      className="relative w-full h-[120px] sm:h-[160px] md:h-[200px] bg-gray-50 overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* IMAGES STACK */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Link href={banner.link_url || '#'} className="block w-full h-full relative">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </Link>
        </div>
      ))}

      {/* NAVIGATION DOTS (Only if > 1 banner) */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                index === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* ARROWS (Visible on Hover) */}
      {banners.length > 1 && (
        <>
            <button 
                onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/50"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/50"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </>
      )}
    </div>
  )
}