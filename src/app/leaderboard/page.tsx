"use client";
import useSWR from 'swr';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function LeaderboardPage() {
  const { data } = useSWR('/api/leaderboard', fetcher);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-500">
            Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Top-rated ideas from our creative community
          </p>
        </div>

        {!data && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data?.data?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
              <p className="text-muted-foreground">Be the first to submit an idea and climb the leaderboard!</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {data?.data?.map((item: any, idx: number) => {
            const rank = idx + 1;
            const isTopThree = rank <= 3;
            
            return (
              <Card 
                key={item.id} 
                hover 
                className={`animate-fade-in ${isTopThree ? 'ring-2 ring-primary/20' : ''}`}
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                        rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold mb-2 truncate">{item.title}</h3>
                        <p className="text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <span className="font-medium">{item.score} points</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-muted-foreground">Posted recently</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-muted-foreground">Community favorite</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Display */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-2xl font-bold ${
                        rank === 1 ? 'text-yellow-600' :
                        rank === 2 ? 'text-gray-500' :
                        rank === 3 ? 'text-orange-600' :
                        'text-primary'
                      }`}>
                        {item.score}
                      </div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Summary */}
        {data?.data?.length > 0 && (
          <Card className="mt-8 bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">{data.data.length}</div>
                  <div className="text-white/90">Total Ideas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {data.data.reduce((sum: number, item: any) => sum + item.score, 0)}
                  </div>
                  <div className="text-white/90">Total Votes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {data.data.length > 0 ? Math.round(data.data.reduce((sum: number, item: any) => sum + item.score, 0) / data.data.length) : 0}
                  </div>
                  <div className="text-white/90">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
