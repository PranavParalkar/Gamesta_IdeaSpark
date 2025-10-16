"use client";
import useSWR from 'swr';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function IdeasPage() {
  const { data: ideasData, mutate } = useSWR('/api/ideas', fetcher);
  
  async function vote(id: number) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) return alert('Please sign in to vote');
    await fetch(`/api/ideas/${id}/vote`, { 
      method: 'POST', 
      body: JSON.stringify({ ideaId: id, vote: 1 }), 
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } 
    });
    mutate();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {ideasData?.data?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to submit an innovative idea!</p>
              <Button>Submit Your Idea</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {ideasData?.data?.map((idea: any, index: number) => (
            <Card key={idea.id} hover className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
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
              
              <CardContent>
                <CardDescription className="text-base leading-relaxed mb-6">
                  {idea.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => vote(idea.id)}
                        className={`flex items-center space-x-1 ${idea.voted_by_you ? 'bg-red-500 text-white' : ''}`}
                      >
                        <span>{idea.voted_by_you ? 'Unvote' : 'Vote'}</span>
                      </Button>
                    </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Discuss</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Save</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
