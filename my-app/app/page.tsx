'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/lib/auth-context';
import HeroCanvas from '@/app/components/HeroCanvas';
import { ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 },
    },
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <HeroCanvas />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-6 neon-text">
            AI <span className="italic">Summary</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-serif max-w-2xl mx-auto leading-relaxed mb-12">
            將繁瑣嘅文件，化成精煉嘅智慧。<br className="hidden md:block" />
            上傳檔案、生成摘要、管理歷史，一站式搞掂。
          </p>

          {/* CTA Buttons */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            className="flex gap-4 justify-center flex-wrap"
          >
            {isLoading ? (
              <div className="h-12 w-40 bg-slate-700/30 rounded-lg animate-pulse" />
            ) : user ? (
              <Link
                href="/app"
                className="btn-primary flex items-center gap-2 group"
              >
                進入應用 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-primary flex items-center gap-2 group"
                >
                  立刻開始 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-secondary flex items-center gap-2 group"
                >
                  了解更多 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>


      
    </div>
  );
}
