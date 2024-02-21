import { useState } from 'react'
import { connectKeplr } from 'services/keplr'
import { Tendermint37Client, Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'

const getStatus = Tendermint34Client.prototype.status

CosmWasmClient.prototype.getHeight = async function () {
  const status = await getStatus.call(this.tmClient)
  return status.syncInfo.latestBlockHeight
}

// @ts-ignore
Tendermint34Client.detectVersion = Tendermint37Client.detectVersion = () => {}
// @ts-ignore
Tendermint34Client.prototype.status = Tendermint37Client.prototype.status =
  () => {
    return {
      nodeInfo: {
        network: PUBLIC_CHAIN_ID,
        version: '',
      },
      syncInfo: { latestBlockHeight: 0 },
    }
  }

export interface ISigningCosmWasmClientContext {
  walletAddress: string
  signingClient: SigningCosmWasmClient | null
  loading: boolean
  error: any
  connectWallet: any
  disconnect: Function
}

export const PUBLIC_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
export const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

export const MULTISIG_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MULTISIG_CODE_ID as string
)

export const GAS_PRICE = GasPrice.fromString(
  (process.env.NEXT_PUBLIC_GAS_PRICE || '0.001') +
    process.env.NEXT_PUBLIC_STAKING_DENOM
)

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [walletAddress, setWalletAddress] = useState('')
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const connectWallet = async () => {
    setLoading(true)

    try {
      await connectKeplr()

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID)

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSigner(
        PUBLIC_CHAIN_ID
      )

      // make client
      const client = await SigningCosmWasmClient.connectWithSigner(
        PUBLIC_RPC_ENDPOINT,
        offlineSigner,
        {
          gasPrice: GAS_PRICE,
        }
      )
      setSigningClient(client)

      // get user address
      const [{ address }] = await offlineSigner.getAccounts()
      setWalletAddress(address)

      setLoading(false)
    } catch (error) {
      setError(error)
    }
  }

  const disconnect = () => {
    if (signingClient) {
      signingClient.disconnect()
    }
    setWalletAddress('')
    setSigningClient(null)
    setLoading(false)
  }

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
  }
}
