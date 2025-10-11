"use client";
import useSWR from 'swr';
import Header from '../../components/Header';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function LeaderboardPage() {
  const { data } = useSWR('/api/leaderboard', fetcher);
  return (
    <div>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        {data?.data?.map((item: any, idx: number) => (
          <div key={item.id} className="border p-3 mb-2 rounded">
            <div className="flex justify-between items-center">
              <div className="font-medium">{idx + 1}. {item.title}</div>
              <div className="text-sm text-gray-600">Score: {item.score}</div>
            </div>
            <p className="text-sm mt-2">{item.description}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
