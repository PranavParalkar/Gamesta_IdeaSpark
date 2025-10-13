"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from './ui/Button';

interface IdeaItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  score: number;
  upvote_count: number;
  vote_count: number;
  rank?: number;
}

export default function ProfileList() {
  const [ideas, setIdeas] = useState<IdeaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
        const res = await fetch('/api/profile/ideas', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || 'Failed to load ideas');
        }
        const json = await res.json();
        setIdeas(json.data || []);
      } catch (e: any) {
        setError(e && e.message ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="py-12 text-center">Loading your ideas…</div>;
  if (error) return <div className="py-12 text-center text-destructive">Error: {error}</div>;
  if (!ideas || ideas.length === 0) return <div className="py-12 text-center">You haven't submitted any ideas yet.</div>;

  return (
    <div className="grid gap-4">
      {ideas.map((idea) => (
        <Card key={idea.id} className="p-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <CardDescription className="line-clamp-2">{idea.description}</CardDescription>
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm text-muted-foreground">Upvotes</div>
                <div className="text-xl font-semibold">{idea.upvote_count}</div>
                <div className="text-sm text-muted-foreground mt-2">Rank #{idea.rank ?? '-'}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap items-center">
              <Button variant="outline" size="sm">View</Button>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
