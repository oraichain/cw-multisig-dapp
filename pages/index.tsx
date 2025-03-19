import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import WalletLoader from 'components/WalletLoader';
import Link from 'next/link';
import { contracts } from '../util/constants';
import { slugify } from '../util/constants';

function updateVisit(contract: string) {
  window.localStorage.setItem(
    contract,
    String(parseInt(window.localStorage.getItem(contract) || '0') + 1)
  );
}

const Home: NextPage = () => {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (router.asPath !== router.route && router.route === '/') {
      router.push(router.asPath);
    } else {
      setLoading(false);

      const filterContracts = filter
        ? Object.entries(contracts).filter(([contract, label]) =>
            label.toLowerCase().includes(filter)
          )
        : Object.entries(contracts);
      setVisits(
        filterContracts
          .map(([contract, label]) => [
            contract,
            localStorage.getItem(contract) || '0',
          ])
          .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
      );
    }
  }, [filter]);

  // Blockchain elements
  const BlockchainIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
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
    <WalletLoader loading={loading}>
      <div className="flex flex-col w-full max-w-4xl px-4 sm:px-6 animate-fadeIn">
        <div className="text-center mb-10 mt-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl rotate-45 animate-pulse-slow"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
                <BlockchainIcon className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Multisig Blockchain Wallet
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Secure multi-signature blockchain transactions with decentralized
            consensus on Oraichain
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 gradient-text flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 3V21M9 3L4 8M9 3L14 8M15 3H21M15 9H21M15 15H21M15 21H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Access Blockchain Node
          </h2>
          <div className="relative rounded-full shadow-md w-full overflow-hidden transition-all duration-300 hover:shadow-lg">
            <input
              id="multisig-address"
              className="input bg-base-100/30 focus:bg-base-100/50 w-full pr-24 rounded-full text-center font-mono text-lg border-white/10 transition-all duration-300"
              placeholder="Enter blockchain address..."
              value={address}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  router.push(`/${event.currentTarget.value}`);
                }
              }}
              onChange={(event) => setAddress(event.target.value)}
            />
            <button
              className="absolute top-0 right-0 bottom-0 px-8 py-5 rounded-r-full bg-gradient-to-r from-primary to-secondary text-white text-xl font-medium transition-all duration-300 hover:opacity-90"
              style={{ marginTop: -10 }}
              onClick={() => {
                const inputEl = document.getElementById(
                  'multisig-address'
                ) as HTMLInputElement;
                router.push(`/${inputEl.value}`);
              }}
            >
              GO
            </button>
          </div>

          <div className="mt-8">
            <button
              className="btn bg-gradient-to-r from-primary to-secondary border-0 text-white btn-lg font-semibold hover:shadow-lg text-xl rounded-full w-full transition-all duration-300 transform hover:opacity-90"
              onClick={() => router.push('/create')}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V20M20 12H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              CREATE NEW MULTISIG NODE
            </button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 gradient-text flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9H21M9 21V9M15 21V9M5 5H7M12 5H14M19 5H21M7 3V7M14 3V7M21 3V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Recent Blockchain Nodes
          </h2>
          <div className="rounded-box mb-6">
            <div className="relative rounded-full overflow-hidden">
              <input
                className="input bg-base-100/30 focus:bg-base-100/50 w-full rounded-full text-center font-mono border-white/10 transition-all duration-300"
                placeholder="Search by node name..."
                onChange={(event) => {
                  setFilter(event.currentTarget.value.trim().toLowerCase());
                }}
              />
              <div className="absolute top-0 right-3 bottom-0 flex items-center text-base-content/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visits.length > 0 ? (
              visits.map(([contract]) => (
                <Link
                  onClick={() => updateVisit(contract)}
                  title={contract}
                  key={contract}
                  href={`/${slugify(contracts[contract])}`}
                  className="bg-base-100/30 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 text-left overflow-hidden flex items-center"
                >
                  <div className="flex items-center w-full">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-2 rounded-lg mr-3 rotate-45 flex items-center justify-center">
                      <BlockchainIcon className="w-5 h-5 text-primary -rotate-45" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium truncate">
                        {contracts[contract]}
                      </span>
                      <span className="text-xs text-base-content/60 font-mono">
                        {contract.slice(0, 10)}...{contract.slice(-10)}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-auto text-primary/70"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-6 text-base-content/60 bg-base-100/20 rounded-lg backdrop-blur-sm">
                No blockchain nodes found. Try creating a new node.
              </div>
            )}
          </div>
        </div>
      </div>
    </WalletLoader>
  );
};

export default Home;
