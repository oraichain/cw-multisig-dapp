import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import { MULTISIG_CODE_ID } from 'hooks/cosmwasm'
import Link from 'next/link'

const Home: NextPage = () => {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [contracts, setContracts] = useState<readonly string[]>([])
  const { signingClient } = useSigningClient()

  useEffect(() => {
    if (!signingClient) return
    signingClient.getContracts(MULTISIG_CODE_ID).then(setContracts)
  }, [signingClient, address])

  if (router.asPath !== router.route && router.route === '/') {
    router.push(router.asPath)
  }

  return (
    <WalletLoader>
      <div className="flex flex-col w-full">
        <div className="grid bg-base-100 place-items-center">
          <h1 className="text-4xl font-bold mb-8">Existing...</h1>
          <div className="w-full max-w-xl xl:max-w-2xl">
            {contracts.map((contract) => (
              <Link
                key={contract}
                href={`/${encodeURIComponent(contract)}`}
                className="block btn btn-link btn-primary w-full max-w-full truncate lowercase text-left"
              >
                {contract}
              </Link>
            ))}
          </div>
          <div className="flex w-full max-w-xl xl:max-w-2xl">
            <div className="relative rounded-full shadow-sm w-full">
              <input
                id="multisig-address"
                className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg"
                placeholder="Multisig contract address..."
                step="0.1"
                value={address}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    router.push(`/${event.currentTarget.value}`)
                  }
                }}
                onChange={(event) => setAddress(event.target.value)}
              />
              <button
                className="absolute top-0 right-0 bottom-0 px-8 py-5 rounded-r-full bg-primary text-base-100 text-xl"
                onClick={() => {
                  const inputEl = document.getElementById(
                    'multisig-address'
                  ) as HTMLInputElement
                  router.push(`/${inputEl.value}`)
                }}
              >
                GO
              </button>
            </div>
          </div>
        </div>
        <div className="divider p-8 before:bg-secondary after:bg-secondary before:h-[1px] after:h-[1px]"></div>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold my-8">New...</h1>
          <div className="w-full max-w-xl xl:max-w-2xl">
            <button
              className="btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full w-full"
              onClick={() => router.push('/create')}
            >
              + CREATE NEW MULTISIG
            </button>
          </div>
        </div>
      </div>
    </WalletLoader>
  )
}

export default Home
