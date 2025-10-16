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

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left text-sm">
            <thead>
              <tr className="text-xs text-white/60 border-b border-white/10 bg-gradient-to-r from-[#1b0b2a] via-[#240c3a] to-[#081426]">
                <th className="px-3 py-2">Place</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Idea Title</th>
                <th className="px-3 py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item: any, idx: number) => {
                const rank = idx + 1;
                const badgeColor = rank === 1 ? 'bg-pink-500 text-black' : rank === 2 ? 'bg-purple-500 text-black' : rank === 3 ? 'bg-yellow-400 text-black' : 'bg-[#0b0b12] text-white/80';
                return (
                  <tr key={item.id} className="align-middle hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 align-middle w-16">
                      <div className="inline-flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-1 ring-white/5 ${badgeColor}`} aria-label={`Place ${rank}`}>
                          {rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle" style={{ maxWidth: 200 }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1f1b2a] flex items-center justify-center text-xs text-white/80">{(item.author_name || '—').slice(0,1)}</div>
                        <div className="truncate">
                          <div className="font-medium text-white/90 truncate" style={{ maxWidth: 160 }}>{item.author_name || '—'}</div>
                          <div className="text-xs text-white/60">@{(item.author_name || '').replace(/\s+/g, '').toLowerCase() || 'unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle truncate" style={{ maxWidth: 420 }}>{item.title}</td>
                    <td className="px-3 py-2 align-middle font-semibold text-lg text-cyan-300">{item.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Stats Summary */}
        {/* {data?.data?.length > 0 && (
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
        )} */}
      </main>
    </div>
  );
}
