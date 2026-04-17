// app/page.js
"use client";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import HomepageHero from "../components/HomepageHero";
import Footer from "@/components/Footer";
import LatestCollections from "@/components/LatestCollections";

function HomeContent() {
  useEffect(() => {
    // Smooth scroll polyfill for older browsers
    if (typeof window !== "undefined") {
      require("smoothscroll-polyfill").polyfill();
    }
  }, []);

  return (
      <div className="font-['Inter']">
        <Navbar />
        <main>
          <HomepageHero />

          <LatestCollections />

          
          {/* Use the new OrderNow component */}

          
          {/* Placeholder sections for navigation */}



          <Footer />
        </main>
      </div>
  );
}

export default HomeContent;