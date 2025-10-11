"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function SubmitPage() {
  // token stored in localStorage after sign-in
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) return alert('Sign in first');
    const res = await fetch('/api/ideas', { method: 'POST', body: JSON.stringify({ title, description }), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    let body = null;
    try { body = await res.json(); } catch (e) { body = await res.text(); }
    if (res.ok) {
      router.push('/ideas');
    } else {
      const msg = body && body.error ? body.error : (typeof body === 'string' ? body : 'Failed to submit');
      alert(msg);
    }
  }

  return (
    <div>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Submit an Idea</h1>
        <form onSubmit={submit} className="space-y-3 max-w-xl">
          <div>
            <label className="block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </main>
    </div>
  );
}
