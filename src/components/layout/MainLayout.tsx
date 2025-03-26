
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Clock, 
  FileAudio
} from 'lucide-react';
import AnimatedTabIndicator from '../ui/AnimatedTabIndicator';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'History', path: '/history', icon: Clock },
  ];
  
  // Get the active index for the tab indicator
  const getActiveIndex = () => {
    return navItems.findIndex(item => item.path === location.pathname);
  };

  // Handle scroll for shadow effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/50">
      {/* Header with logo and navigation */}
      <header 
        className={`sticky top-0 z-10 backdrop-blur-md transition-shadow duration-300 ${
          isScrolled ? 'shadow-md bg-white/70' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative p-1.5 rounded-lg bg-primary/10">
                <FileAudio className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg tracking-tight">AudioProtocol</span>
            </Link>
            
            {/* Navigation */}
            <nav className="relative">
              <div className="flex space-x-2">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <AnimatedTabIndicator 
                  activeIndex={getActiveIndex()} 
                  itemCount={navItems.length} 
                />
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>AudioProtocol &copy; {new Date().getFullYear()} • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
