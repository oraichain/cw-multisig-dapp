import { useSigningClient } from 'contexts/cosmwasm'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from 'components/ThemeToggle'
import NavContractLabel from 'components/NavContractLabel'

function Nav() {
  const { walletAddress, connectWallet, disconnect } = useSigningClient()
  const handleConnect = () => {
    if (walletAddress.length === 0) {
      connectWallet()
    } else {
      disconnect()
    }
  }

  const PUBLIC_SITE_ICON_URL = process.env.NEXT_PUBLIC_SITE_ICON_URL || ''

  return (
    <div className="border-b w-screen px-2 md:px-16">
      <nav className="flex flex-wrap text-center md:text-left md:flex flex-row w-full justify-between items-center py-4 ">
        <div className="flex items-center w-6/12 mb-4">
          <Link href="/">
            {PUBLIC_SITE_ICON_URL.length > 0 ? (
              <Image
                src={PUBLIC_SITE_ICON_URL}
                height={48}
                width={400}
                alt={'Oraichain Logo'}
              />
            ) : (
              <span className="text-2xl">⚛️ </span>
            )}
          </Link>
          <Link href="/">
            <span className="ml-1 md:ml-2 link link-hover font-semibold text-xl md:text-2xl align-top"></span>
          </Link>
        </div>
        <NavContractLabel />
        <ThemeToggle />
        <div className="flex flex-grow md:flex-grow-0 max-w-full">
          <button
            className={`block btn btn-outline btn-primary w-full max-w-full truncate ${
              walletAddress.length > 0 ? 'lowercase' : ''
            }`}
            onClick={handleConnect}
          >
            {walletAddress || 'Connect Wallet'}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Nav
