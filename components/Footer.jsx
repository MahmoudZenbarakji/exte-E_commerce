'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from "@/context/LanguageContext";

function Footer() {
  const [currentYear, setCurrentYear] = useState('2024')
  const { translations } = useLanguage();

  useEffect(() => {
    // Set current year when component mounts
    setCurrentYear(new Date().getFullYear().toString())
  }, [])

  return (
    <>
      {/* Newsletter Section */}
      <section className="newsletter-section font-black">
        <div className="newsletter-container">
          <h2 className="newsletter-title">{translations.stayInTheKnow}</h2>
          <p className="newsletter-description">{translations.subscribeUpdates}</p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder={translations.enterEmail}
              className="newsletter-input"
            />
            <button className="newsletter-button">
              <span className="button-text">{translations.subscribe}</span>
              <div className="button-overlay"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="footer">
        <div className="footer-container">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-container">
              <img
                src="/exte-logo.png"
                alt="EXET"
                className="footer-logo"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                <span className="logo-text">EXET</span>
              </div>
            </div>
            <p className="brand-description ">
              {translations.brandDescription}
            </p>
          </div>

          <div className="footer-grid font-black">
            <div className="footer-column">
              <h3 className="footer-title">{translations.help}</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">{translations.customerService}</a></li>
                <li><a href="#" className="footer-link">{translations.sizeGuide}</a></li>
                <li><a href="#" className="footer-link">{translations.shipping}</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">{translations.collections}</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">{translations.newArrivals}</a></li>
                <li><a href="#" className="footer-link">{translations.bestSellers}</a></li>
                <li><a href="#" className="footer-link">{translations.seasonal}</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">{translations.company}</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">{translations.aboutExet}</a></li>
                <li><a href="#" className="footer-link">{translations.sustainability}</a></li>
                <li><a href="#" className="footer-link">{translations.careers}</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">{translations.contact}</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">{translations.storeLocator}</a></li>
                <li><a href="#" className="footer-link">{translations.contactUs}</a></li>
                <li><a href="#" className="footer-link">{translations.press}</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© {currentYear} EXET. {translations.rightsReserved}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Newsletter Section */
        .newsletter-section {
          background-color: #000;
          color: #fff;
          padding: 5rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .newsletter-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        .newsletter-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .newsletter-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        .newsletter-description {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          font-weight: 300;
          letter-spacing: 0.1em;
          margin-bottom: 3rem;
          opacity: 0.8;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
        }

        .newsletter-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          gap: 0;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
        }

        .newsletter-input {
          flex: 1;
          padding: 1.2rem 1.5rem;
          border: 1px solid #fff;
          border-right: none;
          background: transparent;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
        }

        .newsletter-input:focus {
          outline: none;
          background: rgba(255,255,255,0.05);
        }

        .newsletter-input::placeholder {
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .newsletter-button {
          position: relative;
          padding: 1.2rem 2.5rem;
          border: 1px solid #fff;
          background: transparent;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .newsletter-button:hover {
          background: #fff;
          color: #000;
        }

        .button-text {
          position: relative;
          z-index: 2;
          transition: color 0.3s ease;
        }

        /* Footer */
        .footer {
          background: #fff;
          padding: 4rem 2rem 2rem;
          border-top: 1px solid #e5e5e5;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Logo Section */
        .logo-section {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid #e5e5e5;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.7s forwards;
        }

        .logo-container {
          margin-bottom: 1.5rem;
          display: inline-block;
        }

        .footer-logo {
          height: 60px;
          width: auto;
          filter: grayscale(100%);
          transition: all 0.3s ease;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.8s forwards;
        }

        .footer-logo:hover {
          filter: grayscale(0%);
          transform: scale(1.05);
        }

        .logo-fallback {
          padding: 1rem 2rem;
          border: 1px solid #000;
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          letterSpacing: 0.3em;
          text-transform: uppercase;
          color: #000;
        }

        .brand-description {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          letterSpacing: 0.1em;
          color: #666;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInUp 0.8s ease-out 0.9s forwards;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1s forwards;
        }

        .footer-column {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .footer-column:nth-child(1) { animation-delay: 1.1s; }
        .footer-column:nth-child(2) { animation-delay: 1.2s; }
        .footer-column:nth-child(3) { animation-delay: 1.3s; }
        .footer-column:nth-child(4) { animation-delay: 1.4s; }

        .footer-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letterSpacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          color: #000;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 300;
          letterSpacing: 0.05em;
          color: #666;
          text-decoration: none;
          padding: 0.5rem 0;
          display: block;
          transition: all 0.3s ease;
          position: relative;
        }

        .footer-link:hover {
          color: #000;
          transform: translateX(5px);
        }

        .footer-link::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #000;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .footer-link:hover::before {
          opacity: 1;
        }

        .footer-bottom {
          border-top: 1px solid #e5e5e5;
          padding-top: 2rem;
          text-align: center;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1.5s forwards;
        }

        .copyright {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 300;
          letterSpacing: 0.1em;
          text-transform: uppercase;
          color: #999;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .newsletter-form {
            flex-direction: column;
            gap: 1rem;
          }
          
          .newsletter-input {
            border-right: 1px solid #fff;
            border-bottom: none;
          }
          
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .footer-logo {
            height: 50px;
          }

          .logo-text {
            font-size: 1.5rem;
          }

          .brand-description {
            font-size: 0.8rem;
            padding: 0 1rem;
          }
        }

        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .newsletter-section {
            padding: 3rem 1rem;
          }
          
          .footer {
            padding: 3rem 1rem 2rem;
          }

          .logo-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
          }

          .footer-logo {
            height: 40px;
          }
        }
      `}</style>
    </>
  )
}

export default Footer