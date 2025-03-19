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

  return (
    <WalletLoader loading={loading}>
      <div className="flex flex-col w-full max-w-4xl px-4 sm:px-6 animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Multisig Wallet
          </h1>
          <p className="text-base-content/70 text-lg">
            Secure multi-signature wallet management
          </p>
        </div>

        <div className="card bg-base-200 shadow-xl p-6 mb-8 border border-base-300">
          <h2 className="text-xl font-semibold mb-4">
            Access Existing Multisig
          </h2>
          <div className="relative rounded-full shadow-md w-full overflow-hidden transition-all duration-300 hover:shadow-lg">
            <input
              id="multisig-address"
              className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg bg-base-100 transition-all duration-300"
              placeholder="Multisig contract address..."
              value={address}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  router.push(`/${event.currentTarget.value}`);
                }
              }}
              onChange={(event) => setAddress(event.target.value)}
            />
            <button
              className="absolute top-0 right-0 bottom-0 px-8 py-5 rounded-r-full bg-primary text-primary-content text-xl font-medium transition-all duration-300 hover:bg-primary-focus"
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
              className="btn btn-primary btn-lg font-semibold hover:shadow-lg text-xl rounded-full w-full transition-all duration-300 transform hover:scale-[1.01]"
              onClick={() => router.push('/create')}
            >
              + CREATE NEW MULTISIG
            </button>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl p-6 border border-base-300">
          <h2 className="text-xl font-semibold mb-4">Recent Multisigs</h2>
          <div className="rounded-box shadow-md bg-base-100 mb-6">
            <div className="relative rounded-full overflow-hidden">
              <input
                className="input input-bordered focus:input-primary input-md w-full rounded-full text-center font-mono bg-base-100 transition-all duration-300"
                placeholder="Type to search..."
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
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 text-left overflow-hidden flex items-center"
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium truncate">
                      {contracts[contract]}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-base-content/60">
                No multisig contracts found. Try creating a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </WalletLoader>
  );
};

export default Home;
