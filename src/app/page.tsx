import Header from '../components/Header';

export default function Home() {
  return (
    <div>
      <Header />
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to Gamesta</h1>
        <p className="mb-6">Collect, vote and showcase college fest ideas. Get started by visiting the Ideas page or submit your idea.</p>
        <div className="space-x-4">
          <a href="/ideas" className="px-4 py-2 bg-blue-600 text-white rounded">View Ideas</a>
          <a href="/submit" className="px-4 py-2 border rounded">Submit an Idea</a>
          <a href="/leaderboard" className="px-4 py-2 border rounded">Leaderboard</a>
        </div>
      </main>
    </div>
  );
}
