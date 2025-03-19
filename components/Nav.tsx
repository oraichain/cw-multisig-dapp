import { useSigningClient } from 'contexts/cosmwasm';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from 'components/ThemeToggle';
import NavContractLabel from 'components/NavContractLabel';
import { useState } from 'react';

function Nav() {
  const { walletAddress, connectWallet, disconnect } = useSigningClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConnect = () => {
    if (walletAddress.length === 0) {
      connectWallet();
    } else {
      disconnect();
    }
  };

  const PUBLIC_SITE_ICON_URL = process.env.NEXT_PUBLIC_SITE_ICON_URL || '';

  // Blockchain icon SVG
  const blockchainIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="url(#blockchainGradient)"
      strokeWidth="1.5"
    >
      <defs>
        <linearGradient
          id="blockchainGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="rgb(99, 102, 241)" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" />
        </linearGradient>
      </defs>
      <rect x="2" y="7" width="6" height="6" rx="1" />
      <rect x="9" y="7" width="6" height="6" rx="1" />
      <rect x="16" y="7" width="6" height="6" rx="1" />
      <rect x="9" y="14" width="6" height="6" rx="1" />
      <rect x="16" y="14" width="6" height="6" rx="1" />
      <rect x="2" y="14" width="6" height="6" rx="1" />
      <line x1="5" y1="7" x2="5" y2="5" />
      <line x1="12" y1="7" x2="12" y2="5" />
      <line x1="19" y1="7" x2="19" y2="5" />
      <line x1="4" y1="5" x2="20" y2="5" />
    </svg>
  );

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-base-100/50 border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              {PUBLIC_SITE_ICON_URL.length > 0 ? (
                <Image
                  src={PUBLIC_SITE_ICON_URL}
                  height={40}
                  width={140}
                  alt={'Oraichain Logo'}
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center">
                  {blockchainIcon}
                  <span className="ml-2 font-bold text-xl hidden md:block gradient-text">
                    Multisig Chain
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="btn btn-ghost btn-sm text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavContractLabel />
            <ThemeToggle />
            <button
              className={`btn bg-gradient-to-r from-primary to-secondary border-0 hover:opacity-90 text-white rounded-full ${
                walletAddress.length > 0 ? 'font-mono' : 'font-medium'
              }`}
              onClick={handleConnect}
            >
              {walletAddress ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="truncate max-w-[140px]">
                    {walletAddress}
                  </span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 7H9C7.89543 7 7 7.89543 7 9V18C7 19.1046 7.89543 20 9 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 15C14.5523 15 15 14.5523 15 14C15 13.4477 14.5523 13 14 13C13.4477 13 13 13.4477 13 14C13 14.5523 13.4477 15 14 15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 8V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 10V14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu (expanded) */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <div className="px-2">
                <NavContractLabel />
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <button
                className={`btn bg-gradient-to-r from-primary to-secondary border-0 hover:opacity-90 text-white ${
                  walletAddress.length > 0 ? 'font-mono' : 'font-medium'
                }`}
                onClick={handleConnect}
              >
                {walletAddress ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="truncate max-w-[240px]">
                      {walletAddress}
                    </span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 7H9C7.89543 7 7 7.89543 7 9V18C7 19.1046 7.89543 20 9 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 15C14.5523 15 15 14.5523 15 14C15 13.4477 14.5523 13 14 13C13.4477 13 13 13.4477 13 14C13 14.5523 13.4477 15 14 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 8V16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 10V14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
