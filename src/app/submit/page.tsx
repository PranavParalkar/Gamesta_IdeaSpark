"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) return setError('Title is required');
    if (!description.trim()) return setError('Description is required');
    if (title.length < 5) return setError('Title must be at least 5 characters');
    if (description.length < 20) return setError('Description must be at least 20 characters');
    
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) return setError('Please sign in first');
    
    setLoading(true);
    try {
      const res = await fetch('/api/ideas', { 
        method: 'POST', 
        body: JSON.stringify({ title, description }), 
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        } 
      });
      
      let body = null;
      try { 
        body = await res.json(); 
      } catch (e) { 
        body = await res.text(); 
      }
      
      if (res.ok) {
        router.push('/ideas');
      } else {
        const msg = body && body.error ? body.error : (typeof body === 'string' ? body : 'Failed to submit');
        setError(msg);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to submit');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-500">
              Submit Your Idea
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your innovative college fest idea with the community and get feedback from fellow students.
            </p>
          </div>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Idea Details</CardTitle>
              <CardDescription>
                Provide a clear and compelling description of your idea to help others understand and appreciate it.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                <Input
                  label="Idea Title"
                  placeholder="Enter a catchy title for your idea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Describe your idea in detail. What makes it unique? How would it work? What impact would it have?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    {description.length}/500 characters
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your idea will be reviewed by the community</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={loading}
                      className="min-w-[120px]"
                    >
                      {loading ? 'Submitting...' : 'Submit Idea'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-8 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Tips for a Great Idea</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Be specific and detailed in your description</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Explain how your idea would work in practice</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Highlight what makes your idea unique or innovative</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Consider the feasibility and resources needed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Think about the impact on the college community</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
