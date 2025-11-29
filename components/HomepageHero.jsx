// HomepageHero.jsx
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";

const HomepageHero = () => {
  const backgroundRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const { translations } = useLanguage();
  const [heroImage, setHeroImage] = useState(null);
  const defaultImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

  useEffect(() => {
    // Fetch hero image from API
    const fetchHeroImage = async () => {
      try {
        const response = await fetch("/api/hero", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setHeroImage(data.imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
      }
    };

    fetchHeroImage();
  }, []);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = '1';
        subtitleRef.current.style.transform = 'translateY(0)';
      }
      if (buttonRef.current) {
        buttonRef.current.style.opacity = '1';
        buttonRef.current.style.transform = 'translateY(0)';
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="homepage-hero" 
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Image */}
      <div
        ref={backgroundRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${heroImage })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7,
          transform: 'scale(1.1)',
          transition: 'transform 8s ease-out',
          animation: 'subtleZoom 20s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
      />
      
      {/* Animated Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
          opacity: 0,
          animation: 'fadeInOverlay 2s ease-out 0.5s forwards'
        }}
      />
      
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '1200px',
          padding: '0 20px'
        }}
      >
        {/* Animated Title */}
        <h1
          ref={titleRef}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            lineHeight: 1.1,
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) 0.2s'
          }}
        >
          {translations.exteCollection}
        </h1>
        
        {/* Animated Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '2.5rem',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) 0.4s'
          }}
        >
          {translations.timelessElegance}
        </p>
        
        {/* Animated Button */}
        <Link href="/products">
        <button
          ref={buttonRef}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '1.2em 2.5em',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            cursor: 'pointer',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) 0.6s, background-color 0.3s ease, color 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fff';
            e.target.style.color = '#000';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#fff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
       
          <span 
            style={{
              position: 'relative',
              zIndex: 2,
              transition: 'color 0.3s ease'
            }}
          >
            {translations.discoverNow}
          </span>
        </button>
        </Link>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes subtleZoom {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Floating particles for extra elegance */
        .homepage-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 50px 50px, 80px 80px, 100px 100px;
          animation: floatParticles 20s linear infinite;
          z-index: 1;
          pointer-events: none;
        }

        @keyframes floatParticles {
          0% {
            background-position: 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 50px 50px, 80px 80px, 100px 100px;
          }
        }

        /* Subtle text shadow animation */
        h1 {
          text-shadow: 0 0 0 rgba(255,255,255,0);
          animation: textGlow 4s ease-in-out infinite alternate;
        }

        @keyframes textGlow {
          from {
            text-shadow: 0 0 0 rgba(255,255,255,0);
          }
          to {
            text-shadow: 0 0 20px rgba(255,255,255,0.1);
          }
        }
      `}</style>
    </section>
  );
};

export default HomepageHero;