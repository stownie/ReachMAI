import React from 'react';
import type { UserProfile } from '../types';

interface HeroProps {
  currentProfile?: UserProfile;
}

const Hero: React.FC<HeroProps> = ({ currentProfile }) => {
  const getWelcomeMessage = () => {
    if (!currentProfile) return "Welcome to ReachMAI";
    
    const name = currentProfile.preferredName || currentProfile.firstName;
    
    switch (currentProfile.type) {
      case 'student':
        return `Welcome back, ${name}!`;
      case 'parent':
        return `Welcome, ${name}`;
      case 'teacher':
        return `Hello, ${name}`;
      case 'adult':
        return `Welcome, ${name}`;
      default:
        return `Welcome, ${name}`;
    }
  };

  const getSubMessage = () => {
    if (!currentProfile) {
      return "Your comprehensive platform for MAI programs, scheduling, and communications.";
    }
    
    switch (currentProfile.type) {
      case 'student':
        return "Check your assignments, view your schedule, and track your progress.";
      case 'parent':
        return "Manage your student's enrollments, view schedules, and stay connected.";
      case 'teacher':
        return "Access your teaching schedule, manage assignments, and track attendance.";
      case 'adult':
        return "Explore programs, manage your enrollments, and stay engaged.";
      default:
        return "Access all your MAI platform features in one place.";
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white py-16 shadow-brand-lg">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 font-brand">{getWelcomeMessage()}</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          {getSubMessage()}
        </p>
        {!currentProfile && (
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5">
            Sign In
          </button>
        )}
      </div>
    </section>
  );
};

export default Hero;