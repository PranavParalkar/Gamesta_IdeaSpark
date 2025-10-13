"use client";
import React from 'react';
import Header from '../../components/Header';
import ProfileList from '../../components/ProfileList';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Your Profile</h1>
          <p className="text-muted-foreground mb-6">Here are the ideas you've submitted and their current standing.</p>

          <ProfileList />
        </div>
      </main>
    </div>
  );
}
