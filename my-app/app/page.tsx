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

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">功能特色</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            強大嘅 AI 功能，幫你高效處理文件
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: '快速上傳',
              desc: '支持 PDF、TXT、Markdown 多種格式',
              icon: '📤',
            },
            {
              title: 'AI 摘要',
              desc: '使用先進 AI 模型生成精准摘要',
              icon: '✨',
            },
            {
              title: '歷史管理',
              desc: '保存所有文件和摘要，隨時查閱',
              icon: '📚',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-blue-500/50 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-12 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
        >
          <h3 className="text-4xl font-bold mb-6">準備好提升工作效率？</h3>
          <p className="text-zinc-300 mb-8 text-lg">
            免費試用，無需信用卡
          </p>
          {!user && (
            <Link
              href="/login"
              className="inline-block btn-primary"
            >
              免費開始
            </Link>
          )}
        </motion.div>
      </section>
    </div>
  );
}
