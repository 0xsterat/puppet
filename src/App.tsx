import React, { useState, useCallback } from 'react';
import { ExternalLink, LogIn, UserCircle, Moon, Sun, Copy } from 'lucide-react';
import { useRateLimit, validateProfileLink, sanitizeInput, ErrorMessages } from './utils/security';
import html2canvas from 'html2canvas';
import myImage from './assets/myImage.png';
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [profileLink, setProfileLink] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [countGmRecords, setCountGmRecords] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userName, setUserName] = useState('');

  // Rate limiting: 5 attempts per minute
  const isRateLimited = useRateLimit(5, 60000);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setResult('');
    setShowResult(false);

    // Check rate limiting
    if (isRateLimited()) {
      setError(ErrorMessages.RATE_LIMITED);
      return;
    }

    // Validate input
    const sanitizedLink = sanitizeInput(profileLink);
    if (!validateProfileLink(sanitizedLink)) {
      setError(ErrorMessages.INVALID_URL);
      return;
    }

    setLoading(true);

    try {
      const usernameMatch = sanitizedLink.substring(
        sanitizedLink.lastIndexOf('/') + 1
      );

      // Fetch user data with error handling
      const userResponse = await fetch(
        `https://society.ton.org/v1/users/${usernameMatch}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error(userResponse.status === 404 ? 'User not found' : ErrorMessages.SERVER_ERROR);
      }

      const userData = await userResponse.json();
      setUserName(userData.data.user.name);

      // Fetch SBTs with error handling
      const response = await fetch(
        `https://society.ton.org/v1/users/${usernameMatch}/sbts?_start=0&_end=500`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(ErrorMessages.SERVER_ERROR);
      }

      const data = await response.json();
      
      const gmText = 'gm';
      const gmCount = data.data.sbts.reduce(
        (count: number, item: { name: string }) => {
          if (item.name.toLowerCase().startsWith(gmText)) {
            count++;
          }
          return count;
        },
        0
      );

      setCountGmRecords(gmCount);
      setCount(data.data.count);
      
      const isOg = data.data.sbts.some((item: { sbt_collections_id: number }) => 
        item.sbt_collections_id === 1245
      );
      
      setResult(isOg ? 'You are an OG champ!' : 'You are not an OG.');
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ErrorMessages.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [profileLink, isRateLimited]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setProfileLink(sanitizedValue);
    setError(''); // Clear error when input changes
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      } flex items-center justify-center p-4 transition-colors duration-300`}
    >
      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } p-8 rounded-lg shadow-xl max-w-md w-full transition-colors duration-300 relative bg-cover bg-center`}
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80")',
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 rounded-lg"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Telescope</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode
                  ? 'bg-gray-700 text-yellow-300'
                  : 'bg-white/20 text-yellow-300'
              } backdrop-blur-sm`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="mb-6 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-xl mb-4 text-white">
              Follow these steps:
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <p className="ml-3 text-white">
                  Go to{' '}
                  <a
                    href="https://society.ton.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline font-medium"
                  >
                    society.ton.org
                  </a>
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-2" >
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <p className="ml-3 text-white">
                  Log in to your TON Society account
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <p className="ml-3 text-white">Go to your Profile</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Copy className="w-6 h-6 text-white" />
                </div>
                <p className="ml-3 text-white">Copy your profile link</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="profileLink"
                className="block mb-2 font-medium text-white"
              >
                Paste your TON Society Profile Link
              </label>
              <input
                type="text"
                id="profileLink"
                value={profileLink}
                onChange={handleInputChange}
                placeholder="https://society.ton.org/profile/abcdefghijk"
                className="w-full px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : undefined}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Submit'}
            </button>
          </form>

          {error && (
            <div 
              id="error-message"
              role="alert"
              className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm text-white rounded-md border border-red-500/30"
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 animate-[bounce_1s_ease-in-out] relative bg-cover bg-center overflow-hidden"
            style={{
              backgroundImage:
                `url(${myImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            id="result-modal"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-purple-200/30"></div>

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4 space-x-2">
                <span className="text-4xl animate-[bounce_1s_ease-in-out_infinite]">
                  🎉
                </span>
                <span id="modal-title" className="text-2xl font-bold text-black">
                  $PUPPET Airdrop
                </span>
                <span className="text-4xl animate-[bounce_1s_ease-in-out_infinite] delay-100">
                  🎉
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">
                Hello, {userName}!
              </h3>
              <h3 className="text-2xl font-bold mb-4 text-black">
                You hold {count} SBTs
              </h3>
              <h3 className="text-2xl font-bold mb-4 text-black">
                with {countGmRecords} GM SBTs
              </h3>
              <p
                className={`text-3xl font-bold mb-2 ${
                  result.includes('OG') ? 'text-green-700' : 'text-yellow-400'
                } mb-6`}
              >
                {result}
              </p>
              </div>
            

              <div className = "relative z-10 text-center">
              <button
                onClick={async () => {
                  const canvas = await html2canvas(document.getElementById('result-modal')!, {
                    ignoreElements: (element) => {
                      // Ignore buttons when capturing
                      return element.tagName === 'BUTTON';
                    },
                  });
                  const link = document.createElement('a');
                  link.href = canvas.toDataURL('image/png');
                  link.download = 'postcard.png';
                  link.click();
                }}
                className="mt-4 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium transition-colors duration-300 backdrop-blur-sm border border-white/30"
              >
                Download Postcard
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium transition-colors duration-300 backdrop-blur-sm border border-white/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;