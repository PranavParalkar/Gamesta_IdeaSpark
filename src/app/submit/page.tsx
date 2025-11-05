"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import PrismaticBurst from '../../components/ui/PrismaticBurst';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [followedInstagram, setFollowedInstagram] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { scrollYProgress } = useScroll();
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -200]);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError('Title is required');
    if (!description.trim()) return setError('Description is required');
    if (title.length < 5) return setError('Title must be at least 5 characters');
    if (description.length < 20) return setError('Description must be at least 20 characters');
    if (!followedInstagram)
      return setError('Please follow our Instagram account before submitting your idea');

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gamesta_token') : null;
    if (!token) {
      setError('Please sign in first');
      toast.error('Please sign in first');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ title, description, followedInstagram }),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Idea submitted 🎉');
        router.push('/ideas');
      } else {
        setError(body.error || 'Failed to submit');
        toast.error(body.error || 'Failed to submit');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to submit');
      toast.error(e?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#09021c] to-[#130a3a] relative overflow-hidden">
      {/* ✨ Floating Particle Lights */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: glowOpacity }}
      >
        <PrismaticBurst
          intensity={0.5}
          speed={0.8}
          animationType="rotate3d"
          colors={["#ff5ec8", "#7a5cff", "#00f6ff", "#fff"]}
          mixBlendMode="screen"
        />
      </motion.div>

      <Header />

      <motion.main
        className="container mx-auto px-4  relative z-10"
        style={{ y: yOffset }}
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
           
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-fuchsia-500/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-fuchsia-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>Idea Details</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Be creative and specific — your idea could shape the next big event!
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={submit} className="space-y-6">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Input
                      label="Idea Title"
                      placeholder="Enter a catchy title for your idea"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Description</label>
                      <Textarea
                        placeholder="Describe your idea in detail. What makes it unique? How would it work?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="resize-none bg-black/20 text-white"
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-400">
                        {description.length}/500 characters
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <input
                      id="follow_instagram"
                      type="checkbox"
                      checked={followedInstagram}
                      onChange={(e) => setFollowedInstagram(e.target.checked)}
                      className="accent-fuchsia-500 w-4 h-4"
                    />
                    <label htmlFor="follow_instagram" className="text-sm text-gray-200">
                      I confirm I follow{' '}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://www.instagram.com/gamesta_mitaoe"
                        className="text-fuchsia-400 hover:underline"
                      >
                        gamesta_mitaoe
                      </a>{' '}
                      on Instagram
                    </label>
                  </motion.div>

                  {error && (
                    <motion.div
                      className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between pt-6">
                    <motion.div
                      className="text-sm text-gray-400 flex items-center space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <svg
                        className="w-4 h-4 text-fuchsia-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                      <span>Your idea will be reviewed by the community</span>
                    </motion.div>

                    <div className="flex space-x-3">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button
                          type="submit"
                          loading={loading}
                          className="min-w-[130px] bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all"
                        >
                          {loading ? 'Submitting...' : 'Submit Idea 🚀'}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✨ Tips Card */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-fuchsia-400 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>Tips for a Great Idea</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Be specific and detailed in your description</li>
                  <li>• Explain how your idea would work in practice</li>
                  <li>• Highlight what makes your idea unique or innovative</li>
                  <li>• Consider the feasibility and resources needed</li>
                  <li>• Think about the impact on the college community</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
