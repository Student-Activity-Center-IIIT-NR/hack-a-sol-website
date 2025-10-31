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

  useEffect(() => {
    // Reduce loading time to 3 seconds for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Navigation />
      <main>
        <section id="hero">
          <Suspense fallback={<div style={{height:'100vh'}} />}> 
            <HeroSection />
          </Suspense>
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
