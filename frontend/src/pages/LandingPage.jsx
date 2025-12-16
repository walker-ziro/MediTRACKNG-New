import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const LandingPage = () => {
  const { theme, darkMode } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check login status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: 'fa-user-md',
      title: 'For Providers',
      description: 'Streamline patient care with advanced electronic health records and real-time analytics.',
      link: '/provider/login'
    },
    {
      icon: 'fa-procedures',
      title: 'For Patients',
      description: 'Access your medical history, prescriptions, and appointments in one secure portal.',
      link: '/patient/login'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure & Private',
      description: 'Bank-grade encryption ensures your sensitive health data remains protected at all times.',
      link: '#'
    },
    {
      icon: 'fa-hospital',
      title: 'Facility Management',
      description: 'Comprehensive tools for hospital administration, resource allocation, and reporting.',
      link: '#'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`fixed w-full py-4 px-6 flex justify-between items-center z-50 transition-all duration-300 ${
        scrolled 
          ? (darkMode ? 'bg-gray-900/95 border-b border-gray-800 shadow-lg backdrop-blur-md' : 'bg-white/95 border-b border-gray-200 shadow-lg backdrop-blur-md') 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <i className="fas fa-heartbeat text-xl text-white animate-pulse"></i>
          </div>
          <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Medi<span className="text-blue-600">TRACKNG</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Link 
              to="/login" 
              className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-sm md:text-base ${
                darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              <span className="md:hidden">Login</span>
              <span className="hidden md:inline">Login / Sign Up</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-0 right-0 w-1/2 h-full opacity-10 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-l-full transform translate-x-1/3`}></div>
          <div className={`absolute bottom-0 left-0 w-96 h-96 opacity-10 ${darkMode ? 'bg-purple-900' : 'bg-blue-200'} rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2`}></div>
        </div>

        <div className="container mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center text-center">
          <div className="animate-fade-in-up">
            <h1 className={`text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Healthcare Reimagined for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Every Nigerian
              </span>
            </h1>
            <p className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              A unified, secure, and accessible digital health platform connecting patients, providers, and facilities nationwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login" className="group px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                Get Started
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </Link>
              <a href="#features" className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 hover:-translate-y-1 ${darkMode ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-200 text-gray-900 hover:bg-white hover:shadow-lg'}`}>
                Learn More
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {[
              { value: '10M+', label: 'Patient Records', icon: 'fa-users' },
              { value: '5000+', label: 'Healthcare Facilities', icon: 'fa-hospital-alt' },
              { value: '99.9%', label: 'Uptime Reliability', icon: 'fa-server' }
            ].map((stat, index) => (
              <div key={index} className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:border-blue-100'}`}>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto text-blue-600 dark:text-blue-400">
                  <i className={`fas ${stat.icon} text-xl`}></i>
                </div>
                <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-sm font-medium uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className={`py-24 px-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose MediTRACKNG?</h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced features designed for modern healthcare needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link 
                to={feature.link} 
                key={index}
                className={`group p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 hover:border-blue-500/50' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-200'
                }`}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                  <i className={`fas ${feature.icon} text-2xl text-white`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-heartbeat text-sm text-white"></i>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Medi<span className="text-blue-600">TRACKNG</span>
            </span>
          </div>
          
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 MediTRACKNG. Ministry of Health, Nigeria.
          </p>
          
          <div className="flex gap-8">
            <Link to="/admin/login" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Admin Portal
            </Link>
            <a href="#" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Privacy Policy
            </a>
            <a href="#" className={`text-sm font-medium hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
