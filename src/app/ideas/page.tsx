"use client";
import { useState } from 'react';
import useSWR from 'swr';
import PrismaticBurst from '../../components/ui/PrismaticBurst';
import StarBorder from '../../components/ui/StarBorder';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function IdeasPage() {
  const { data: ideasData, mutate } = useSWR('/api/ideas', fetcher);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [animating, setAnimating] = useState<Record<number, boolean>>({});

  async function vote(id: number) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) return alert('Please sign in to vote');
    await fetch(`/api/ideas/${id}/vote`, { 
      method: 'POST', 
      body: JSON.stringify({ ideaId: id, vote: 1 }), 
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } 
    });
    mutate();
    // trigger a short burst animation for feedback
    setAnimating((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      setAnimating((s) => {
        const copy = { ...s } as Record<number, boolean>;
        delete copy[id];
        return copy;
      });
    }, 700);
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full-page PrismaticBurst background (like login) */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={1.2}
          speed={0.5}
          animationType="rotate3d"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff"]}
          mixBlendMode="screen"
        />
      </div>
      <Header />
      
  <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4  text-gray-500">
            Community Ideas
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover innovative ideas from talented students and vote for your favorites.
          </p>
        </div>

        {!ideasData && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <StarBorder as="div" key={i} className="block animate-pulse" color="#7a5cff" speed="6s">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to submit an innovative idea!</p>
                <Button>Submit  </Button>
              </CardContent>
            </div>
          </StarBorder>
        )}

        <div className="space-y-6">
          {ideasData?.data?.map((idea: any, index: number) => (
            <StarBorder as="div" key={idea.id} className="block" color="#7a5cff" speed="6s">
              <div className="relative z-10 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{idea.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span>Score: {idea.score}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Posted recently</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardDescription className="text-base leading-relaxed mb-6">
                  {idea.description}
                </CardDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 relative rounded-full overflow-hidden"
                      onMouseEnter={() => setHoveredId(idea.id)}
                      onMouseLeave={() => setHoveredId((v) => (v === idea.id ? null : v))}
                    />
                    <Button
                      size="sm"
                      onClick={() => vote(idea.id)}
                      className="flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span>Upvote</span>
                    </Button>
                  </div>
                </div>
              </div>
            </StarBorder>
          ))}
        </div>
      </main>
    </div>
  );
}
