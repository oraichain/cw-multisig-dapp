import { ReactNode, useEffect } from 'react';
import { useSigningClient } from 'contexts/cosmwasm';
import Loader from './Loader';
import LineAlert from './LineAlert';

function WalletLoader({
  children,
  loading = false,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  const { walletAddress, error, connectWallet } = useSigningClient();

  useEffect(() => {
    // auto connect when open page
    if (walletAddress.length === 0) {
      connectWallet();
    }

    window.addEventListener('keplr_keystorechange', connectWallet);
    return () => {
      window.removeEventListener('keplr_keystorechange', connectWallet);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader />
        <p className="mt-2 text-base-content/80 text-lg animate-fadeIn bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium">
          Synchronizing with blockchain...
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 animate-fadeIn max-w-lg mx-auto w-full">
          <LineAlert
            variant="error"
            className="text-lg font-medium px-4 py-3 rounded-lg shadow-md backdrop-blur-sm"
            msg={error.message ?? String(error)}
          />
        </div>
      )}
      <div className="animate-fadeIn">{children}</div>
    </>
  );
}

export default WalletLoader;
