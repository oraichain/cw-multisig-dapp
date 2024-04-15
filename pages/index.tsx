import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import WalletLoader from 'components/WalletLoader';
import Link from 'next/link';
import { contracts } from '../util/constants';
import { slugify } from '../util/constants';

const updateVisit = (contract: string) => {
  window.localStorage.setItem(
    contract,
    String(parseInt(window.localStorage.getItem(contract) || '0') + 1)
  );
};

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
      <div className="flex flex-col w-full">
        <div className="grid bg-base-100 place-items-center">
          <div className="flex w-full max-w-xl xl:max-w-2xl mt-4">
            <div className="relative rounded-full shadow-sm w-full">
              <input
                id="multisig-address"
                className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg"
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
                className="absolute top-0 right-0 bottom-0 px-8 py-5 rounded-r-full bg-primary text-base-100 text-xl"
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
          </div>

          <div className="w-full max-w-xl xl:max-w-2xl mt-6">
            <button
              className="btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full w-full"
              onClick={() => router.push('/create')}
            >
              + CREATE NEW MULTISIG
            </button>
          </div>
        </div>

        <div className="block mt-4">
          <div className="grid bg-base-100 place-items-center my-4">
            <div className="flex w-full max-w-xl xl:max-w-2xl mt-4">
              <div className="relative rounded-full shadow-sm w-full">
                <input
                  id="filter-address"
                  className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg"
                  placeholder="Existing..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setFilter(event.currentTarget.value.trim().toLowerCase());
                    }
                  }}
                />
                <button
                  className="absolute top-0 right-0 bottom-0 px-8 py-5 rounded-r-full bg-primary text-base-100 text-xl"
                  onClick={() => {
                    const inputEl = document.getElementById(
                      'filter-address'
                    ) as HTMLInputElement;
                    setFilter(inputEl.value.trim().toLowerCase());
                  }}
                >
                  SEARCH
                </button>
              </div>
            </div>
          </div>

          {visits.map(([contract]) => (
            <Link
              onClick={() => updateVisit(contract)}
              title={contract}
              key={contract}
              href={`/${slugify(contracts[contract])}`}
              className="btn btn-link btn-primary text-lg truncate normal-case"
            >
              {contracts[contract]}
            </Link>
          ))}
        </div>
      </div>
    </WalletLoader>
  );
};

export default Home;
