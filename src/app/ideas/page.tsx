"use client";
import useSWR from 'swr';
import Header from '../../components/Header';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json());
};

export default function IdeasPage() {
  const { data: ideasData, mutate } = useSWR('/api/ideas', fetcher);
  async function vote(id: number, v: number) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) return alert('Please sign in to vote');
    await fetch(`/api/ideas/${id}/vote`, { method: 'POST', body: JSON.stringify({ ideaId: id, vote: v }), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    mutate();
  }

  return (
    <div>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ideas</h1>
        {!ideasData && <div>Loading...</div>}
        {ideasData?.data?.map((idea: any) => (
          <div key={idea.id} className="border p-4 mb-3 rounded">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">{idea.title}</h2>
              <div className="text-sm">Score: {idea.score}</div>
            </div>
            <p className="mt-2">{idea.description}</p>
            <div className="mt-3">
              <button onClick={() => vote(idea.id, 1)} className="mr-2">Upvote</button>
              <button onClick={() => vote(idea.id, -1)}>Downvote</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
