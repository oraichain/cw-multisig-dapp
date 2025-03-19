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

  return (
    <div className="sticky top-0 z-30 bg-base-100 border-b border-base-300 backdrop-blur bg-opacity-90">
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
                  <span className="text-2xl">⚛️</span>
                  <span className="ml-2 font-bold text-xl hidden md:block">
                    Multisig
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="btn btn-ghost btn-sm"
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
              className={`btn btn-primary btn-sm px-4 rounded-full ${
                walletAddress.length > 0 ? 'font-mono' : 'font-medium'
              }`}
              onClick={handleConnect}
            >
              {walletAddress ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  <span className="truncate max-w-[140px]">
                    {walletAddress}
                  </span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu (expanded) */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-base-200 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <div className="px-2">
                <NavContractLabel />
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <button
                className={`btn btn-primary btn-sm rounded-lg ${
                  walletAddress.length > 0 ? 'font-mono' : 'font-medium'
                }`}
                onClick={handleConnect}
              >
                {walletAddress ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    <span className="truncate max-w-[240px]">
                      {walletAddress}
                    </span>
                  </div>
                ) : (
                  'Connect Wallet'
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
