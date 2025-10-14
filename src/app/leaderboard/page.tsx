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

      <main className="container mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 drop-shadow-[0_8px_30px_rgba(124,58,237,0.25)]">
            Leaderboard
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Top-rated ideas from our creative community — neon bright, fast, and futuristic.
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

        <div className="space-y-6">
          {data?.data?.map((item: any, idx: number) => {
            const rank = idx + 1;
            const isTopThree = rank <= 3;
            const neon = isTopThree ? (rank === 1 ? 'from-pink-500 to-cyan-400' : rank === 2 ? 'from-purple-400 to-blue-400' : 'from-yellow-400 to-orange-400') : 'from-transparent to-transparent';

            return (
              <Card 
                key={item.id}
                hover
                className={`relative overflow-hidden bg-black/40 backdrop-blur-md border border-[#2b2740] text-white/90 transform transition hover:scale-[1.01]`} 
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* neon glow background for top 3 */}
                {isTopThree && (
                  <div className={`absolute -inset-1 bg-gradient-to-r ${neon} opacity-30 blur-3xl pointer-events-none`} />
                )}
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg ring-1 ${
                        isTopThree ? 'ring-white/10' : 'ring-white/5'
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          rank === 1 ? 'bg-gradient-to-r from-pink-400 to-cyan-400 text-black' :
                          rank === 2 ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-black' :
                          rank === 3 ? 'bg-gradient-to-r from-yellow-300 to-orange-400 text-black' :
                          'bg-[#0b0b12] text-white/80'
                        }`}>
                          {rank <= 3 ? (rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉') : rank}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold mb-2 truncate text-white">{item.title}</h3>
                        <p className="text-white/70 line-clamp-2 mb-3">{item.description}</p>

                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-sm text-white/80">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <span className="font-medium">{item.score}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Posted recently</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-3xl font-extrabold ${isTopThree ? 'text-white' : 'text-cyan-300'}`}>
                        {item.score}
                      </div>
                      <div className="text-sm text-white/70">points</div>
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
