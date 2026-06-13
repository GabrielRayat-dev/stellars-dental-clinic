import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <Navbar />
      
      {/* Background Pattern */}
      <div className="bg-dental-pattern" />

      {/* Main Content Area */}
      <main className="landing-main">
        <div className="landing-hero-card animate-fade-in">
          <h1 className="landing-title">
            Welcome to Stellar's Dental Clinic
          </h1>
          <p className="landing-subtitle">
            Your smile is our passion. Premium oral healthcare services tailored just for you.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Landing;
