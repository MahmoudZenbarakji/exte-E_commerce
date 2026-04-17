import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

const SmoothScrollPolyfill = dynamic(() => import('@/components/SmoothScrollPolyfill'));
const HomepageHero = dynamic(() => import('@/components/HomepageHero'), {
  loading: () => (
    <section className="h-screen w-full bg-neutral-950 animate-pulse" aria-hidden="true" />
  ),
});
const LatestCollections = dynamic(() => import('@/components/LatestCollections'), {
  loading: () => (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});
const Footer = dynamic(() => import('@/components/Footer'));

export default function HomePage() {
  return (
    <div className="font-['Inter']">
      <SmoothScrollPolyfill />
      <Navbar />
      <main>
        <HomepageHero />
        <LatestCollections />
        <Footer />
      </main>
    </div>
  );
}
