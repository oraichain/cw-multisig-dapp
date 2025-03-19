// @ts-nocheck
import 'styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from 'components/Layout';
import { SigningCosmWasmProvider } from 'contexts/cosmwasm';
import { useEffect } from 'react';

const handler = (event: KeyboardEvent) => {
  if (event.target.tagName === 'INPUT' && event.target.type === 'number') {
    if (event.keyCode === 38 || event.keyCode === 40) {
      event.preventDefault();
    }
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <SigningCosmWasmProvider>
      <Layout>
        <div className="page-transition">
          <Component {...pageProps} />
        </div>
      </Layout>
    </SigningCosmWasmProvider>
  );
}
export default MyApp;
