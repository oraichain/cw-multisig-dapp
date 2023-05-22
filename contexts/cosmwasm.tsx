import { createContext, useContext, ReactNode } from 'react'
import {
  useSigningCosmWasmClient,
  ISigningCosmWasmClientContext,
} from 'hooks/cosmwasm'

const CosmWasmContext = createContext<ISigningCosmWasmClientContext>({
  walletAddress: '',
  signingClient: null,
  loading: false,
  error: null,
  connectWallet: () => {},
  disconnect: () => {},
})
const { Provider } = CosmWasmContext

export const useSigningClient = (): ISigningCosmWasmClientContext =>
  useContext(CosmWasmContext)

export const SigningCosmWasmProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const value = useSigningCosmWasmClient()
  return <Provider value={value}>{children}</Provider>
}
