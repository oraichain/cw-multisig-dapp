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
      <div className="flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {error && (
        <LineAlert
          variant="error"
          className="text-xl font-bold"
          msg={error.message ?? error}
        />
      )}
      {children}
    </>
  );
}

export default WalletLoader;
