"use client";
import { useState } from 'react';
import useSWR from 'swr';
import PrismaticBurst from '../../components/ui/PrismaticBurst';
import StarBorder from '../../components/ui/StarBorder';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { motion, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function IdeasPage() {
  const { data: ideasData, mutate } = useSWR('/api/ideas', fetcher);
  const [animating, setAnimating] = useState<Record<number, boolean>>({});

  // ✅ Page-level scroll tracking (no hydration errors)
  const { scrollYProgress } = useScroll();
  const lineY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  async function vote(id: number) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) {
      toast.error('Please sign in to vote');
      return;
    }

    // optimistic update kept
    setAnimating((s) => ({ ...s, [id]: true }));
    toast.success('Voted ✔️');

    try {
      const res = await fetch(`/api/ideas/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ ideaId: id, vote: 1 }),
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        throw new Error('Vote failed');
      }
      mutate();
    } catch (err) {
      toast.error('Vote failed. Try again.');
    } finally {
      setTimeout(() => {
        setAnimating((s) => {
          const copy = { ...s } as Record<number, boolean>;
          delete copy[id];
          return copy;
        });
      }, 700);
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={0.5}
          speed={0.5}
          animationType="rotate3d"
          colors={['#ff5ec8', '#7a5cff', '#00f6ff']}
          mixBlendMode="screen"
        />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">Community Ideas</h1>
          <p className="text-md text-muted-foreground">
            Discover innovative ideas from talented students and vote for your favorites.
          </p>
        </div>

        {!ideasData && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <StarBorder as="div" key={i} className="block animate-pulse " color="#7a5cff" speed="6s">
                <div className="relative z-10">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </div>
              </StarBorder>
            ))}
          </div>
        )}

        {ideasData?.data?.length === 0 && (
          <StarBorder as="div" className="block text-center py-12" color="#7a5cff" speed="6s">
            <div className="relative z-10">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to submit an innovative idea!</p>
                <Button>Submit</Button>
              </CardContent>
            </div>
          </StarBorder>
        )}

        {/* ✅ Timeline Layout using global scroll */}
        {ideasData?.data && (
          <div className="relative w-full py-20">
            {/* Animated line that reacts to page scroll */}
            <motion.div
              style={{ height: lineY }}
              className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-400 to-transparent rounded-full transform -translate-x-1/2"
            />

            <div className="relative">
              {ideasData.data.map((idea: any, index: number) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className={`relative mx-40 flex ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Connector Dot */}
                  <div className="absolute left-1/2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full transform -translate-x-1/2 shadow-lg shadow-purple-500/30"></div>

                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      rotateY: 3,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                    }}
                    className="w-[45%] bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative z-10"
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-spin-slow" />
                      <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl mb-2 text-white group-hover:text-purple-400 transition-colors">
                        {idea.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                          </span>
                          <span>Score: {idea.score}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Posted recently</span>
                        </span>
                      </div>
                    </CardHeader>

                    <CardDescription className="text-base leading-relaxed mb-6 line-clamp-3 hover:line-clamp-none transition-all duration-300">
                      {idea.description}
                    </CardDescription>

                    {/* Interactive Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-shadow"
                        onClick={() => vote(idea.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        <span>Upvote</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <style jsx>{`
              @keyframes spin-slow {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              .animate-spin-slow {
                animation: spin-slow 10s linear infinite;
              }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
}
