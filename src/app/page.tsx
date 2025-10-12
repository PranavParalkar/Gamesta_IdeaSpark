"use client";
import React, { useState } from 'react';
// import { motion } from 'framer-motion';  // removed to avoid runtime build error
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-primary ">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 min-h-screen">
       
        <div className=" mx-auto px-4 relative z-10">
          <div className="text-center text-white space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Spark Your
              <span className="block ">
                Creative Ideas
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join the community of innovators. Collect, vote, and showcase college fest ideas that inspire and transform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button size="lg" className="bg-gradient-to-l from-pink-300 to-purple-500 text-primary hover:bg-white/90 text-lg px-8 py-3">
                Explore Ideas
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3">
                Submit Your Idea
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-custom"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce-custom" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce-custom" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-20  bg-white mx-24 rounded-3xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Gamesta?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A platform designed for creative minds to collaborate, innovate, and bring their ideas to life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card
              hover
              className="relative overflow-hidden animate-slide-in hover:scale-105 transform-gpu transition-transform duration-400"
              style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
              onMouseEnter={() => setHoveredCard('innovative')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* animated gradient overlay (replaces image) - smoother scale & opacity */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  transform: hoveredCard === 'innovative' ? 'scale(1.06)' : 'scale(1)',
                  opacity: hoveredCard === 'innovative' ? 1 : 0,
                  transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease-out',
                  willChange: 'transform, opacity',
                  transformOrigin: 'center center',
                  background: 'linear-gradient(135deg, #FDA4E0 0%, #8B5CF6 100%)'
                }}
              />

              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle>Innovative Ideas</CardTitle>
                <CardDescription>
                  Discover creative and innovative ideas from talented students across colleges.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card
              hover
              className="relative overflow-hidden animate-slide-in hover:scale-105 transform-gpu transition-transform duration-400"
              style={{ animationDelay: '0.2s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
              onMouseEnter={() => setHoveredCard('voting')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  transform: hoveredCard === 'voting' ? 'scale(1.06)' : 'scale(1)',
                  opacity: hoveredCard === 'voting' ? 1 : 0,
                  transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease-out',
                  willChange: 'transform, opacity',
                  transformOrigin: 'center center',
                  background: 'linear-gradient(135deg, #FFB6C1 0%, #C084FC 100%)'
                }}
              />

              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <CardTitle>Community Voting</CardTitle>
                <CardDescription>
                  Vote for your favorite ideas and help the best ones rise to the top.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card
              hover
              className="relative overflow-hidden animate-slide-in hover:scale-105 transform-gpu transition-transform duration-400"
              style={{ animationDelay: '0.4s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
              onMouseEnter={() => setHoveredCard('fast')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  transform: hoveredCard === 'fast' ? 'scale(1.06)' : 'scale(1)',
                  opacity: hoveredCard === 'fast' ? 1 : 0,
                  transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease-out',
                  willChange: 'transform, opacity',
                  transformOrigin: 'center center',
                  background: 'linear-gradient(135deg, #F472B6 0%, #6D28D9 100%)'
                }}
              />

              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle>Fast & Easy</CardTitle>
                <CardDescription>
                  Submit your ideas quickly and easily with our streamlined interface.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card gradient className="text-center p-12 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg text-white/90 mb-8">
                Join thousands of students sharing their innovative ideas and making a difference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="  hover:bg-white/90">
                  View Ideas
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Submit Idea
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.jpg" alt="Gamesta" className="h-8 w-8 object-contain rounded" />
            <span className="text-xl font-bold">Gamesta</span>
          </div>
          <p className="text-muted-foreground">
            Empowering creativity and innovation in college communities.
          </p>
        </div>
      </footer>
    </div>
  );
}
