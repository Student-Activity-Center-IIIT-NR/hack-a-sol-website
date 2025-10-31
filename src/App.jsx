import { useState, useEffect, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
const HeroSection = lazy(() => import('./components/HeroSection'));
import AboutSection from './components/AboutSection';
import ThemesSection from './components/ThemesSection';
import ScheduleSection from './components/ScheduleSection';
import SponsorsSection from './components/SponsorsSection';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    // Reduce initial loading time to 3 seconds for better UX (keeps LoadingScreen visible)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <Navigation />
      <main>
        <section id="hero">
          {/* Mount the lazy HeroSection so it begins loading immediately, but keep showing LoadingScreen
              until the HeroSection signals it's fully ready (via onReady). We use Suspense with no
              visual fallback because we render LoadingScreen here while waiting. */}
          <Suspense fallback={null}>
            <div style={{ display: heroReady ? 'block' : 'none' }}>
              <HeroSection onReady={() => setHeroReady(true)} />
            </div>
          </Suspense>

          {/* Always show LoadingScreen until both the initial app loading is done and hero is ready */}
          {(!heroReady || loading) && <LoadingScreen />}
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <section id="themes">
          <ThemesSection />
        </section>
        <section id="schedule">
          <ScheduleSection />
        </section>
        <section id="sponsors">
          <SponsorsSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App
