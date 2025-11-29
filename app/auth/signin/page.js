'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Image from "next/image";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { currentLanguage, translations } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const trimmedEmail = email.toLowerCase().trim();

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError(t.passwordsDontMatch || "Passwords don't match");
        setLoading(false);
        return;
      }
      
      // Basic email validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError(t.invalidEmail || "Invalid email address format");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            firstName,
            lastName,
            email: trimmedEmail,
            password: password
          }),
        });
        
        const responseText = await response.text();
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: `Server error: ${response.status}` };
          }
          setError(errorData.error || t.signupError || 'Signup failed');
          setLoading(false);
          return;
        }
        
        const data = JSON.parse(responseText);
        const result = await signIn('credentials', {
          redirect: false,
          email: trimmedEmail,
          password: password
        });
        
        if (result.error) {
          setError(t.signinAfterSignupFailed || 'Signup successful! Please sign in');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Signup error:', err);
        setError(t.networkError || 'Network error');
      }
    } else {
      // Sign in
      const result = await signIn('credentials', {
        redirect: false,
        email: trimmedEmail,
        password: password
      });
      
      if (result.error) {
        setError(t.invalidCredentials || 'Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    }
    
    setLoading(false);
  };

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const isRTL = currentLanguage === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col" >
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="relative bg-black/40 backdrop-blur-md border border-gray-700 p-12 rounded-none w-full max-w-md">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          
          <h2 className="text-white text-3xl font-light tracking-wider mb-8 text-center uppercase">
            {isSignUp ? (translations.signUp || 'CREATE ACCOUNT') : (translations.signIn || 'SIGN IN')}
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 text-sm font-light tracking-wide">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-light tracking-wide mb-3 uppercase" htmlFor="firstName">
                    {translations.firstName || 'First Name'}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white font-light tracking-wide placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-light tracking-wide mb-3 uppercase" htmlFor="lastName">
                    {translations.lastName || 'Last Name'}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white font-light tracking-wide placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200"
                    required
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-gray-300 text-sm font-light tracking-wide mb-3 uppercase" htmlFor="email">
                {translations.email || 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white font-light tracking-wide placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-light tracking-wide mb-3 uppercase" htmlFor="password">
                {translations.password || 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white font-light tracking-wide placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200"
                required
              />
            </div>
            
            {isSignUp && (
              <div>
                <label className="block text-gray-300 text-sm font-light tracking-wide mb-3 uppercase" htmlFor="confirmPassword">
                  {translations.confirmPassword || 'Confirm Password'}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white font-light tracking-wide placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200"
                  required
                />
              </div>
            )}
            
            {!isSignUp && (
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-gray-400 hover:text-white text-xs font-light tracking-wide uppercase transition-colors duration-200 cursor-pointer"
                >
                  {translations.forgotPassword || 'Forgot Password?'}
                </button>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-white text-black py-4 px-6 text-sm font-light tracking-wider uppercase hover:bg-gray-200 transition-all duration-200 cursor-pointer border border-white ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {translations.loading || 'PROCESSING...'}
                </span>
              ) : isSignUp ? (
                translations.signUp || 'CREATE ACCOUNT'
              ) : (
                translations.signIn || 'SIGN IN'
              )}
            </button>
            
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm font-light tracking-wide mb-4">
                {isSignUp
                  ? translations.alreadyHaveAccount || 'ALREADY HAVE AN ACCOUNT?'
                  : translations.dontHaveAccount || "DON'T HAVE AN ACCOUNT?"}
              </p>
              <button
                type="button"
                onClick={toggleFormMode}
                className="text-white font-light tracking-wider text-sm uppercase hover:underline cursor-pointer transition-all duration-200"
              >
                {isSignUp ? translations.signIn : translations.signUp || 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>

          {/* Luxury Brand Elements */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black pointer-events-none"></div>
    </div>
  );
}