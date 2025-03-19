import { ReactNode } from 'react';
import Head from 'next/head';
import Nav from './Nav';

const PUBLIC_SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE;
const POWERED_BY_URL = 'https://orai.io';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-base-100 to-base-200 text-base-content">
      <Head>
        <title>{PUBLIC_SITE_TITLE}</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Nav />

      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8 md:py-12 relative z-10">
        {children}
      </main>

      <footer className="py-6 border-t border-white/10 backdrop-blur-sm bg-base-100/20 relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-4">
          <div className="text-sm text-base-content/70 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Multisig Wallet. All rights
            reserved.
          </div>
          <div className="flex items-center">
            Powered by{' '}
            <a
              className="ml-1 link text-primary hover:text-secondary transition-colors font-medium flex items-center"
              href={POWERED_BY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>Oraichain</div>
              <svg
                className="w-3.5 h-3.5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
