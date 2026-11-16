import { isDeliverTxFailure } from '@cosmjs/stargate'
import LineAlert from 'components/LineAlert'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import {
  GROUP_GAS_MULTIPLIER,
  buildCreateGroupWithPolicyMsg,
} from 'util/groupTx'

function AddressRow({
  idx,
  readOnly,
  onRemove,
}: {
  idx: number
  readOnly: boolean
  onRemove?: (id: number) => void
}) {
  return (
    <tr>
      <td className="pr-2 pb-2">
        <input
          className="block box-border m-0 w-full rounded input input-bordered focus:input-primary font-mono"
          type="text"
          name={`address_${idx}`}
          placeholder="wallet address..."
          size={45}
          readOnly={readOnly}
        />
      </td>
      <td className="pb-2">
        <div className="flex items-center block input-bordered input box-border focus:input-primary m-0 w-full rounded pr-0 font-mono">
          <input
            type="number"
            className="bg-transparent outline-none"
            name={`weight_${idx}`}
            defaultValue="1"
            min={1}
            max={999}
            readOnly={readOnly}
          />
          {idx > 1 && (
            <button
              type="button"
              onClick={() => onRemove?.(idx)}
              className="p-2 text-lg"
            >
              &#10008;
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function extractGroupPolicyAddress(result: {
  events?: ReadonlyArray<{
    type: string
    attributes: ReadonlyArray<{ key: string; value: string }>
  }>
}): string | null {
  for (const ev of result.events || []) {
    if (
      ev.type === 'cosmos.group.v1.EventCreateGroupPolicy' ||
      ev.type === 'create_group_policy'
    ) {
      const addr = ev.attributes.find(
        (a) => a.key === 'address' || a.key === 'group_policy_address'
      )
      if (addr?.value) return addr.value.replace(/^"|"$/g, '')
    }
  }
  return null
}

const CreateGroup: NextPage = () => {
  const router = useRouter()
  const { walletAddress, signingClient } = useSigningClient()
  const [addressIds, setAddressIds] = useState([0, 1])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  const onAdd = () => setAddressIds((ids) => [...ids, Math.max(...ids) + 1])
  const onRemove = (id: number) =>
    setAddressIds((ids) => ids.filter((x) => x !== id))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!signingClient || !walletAddress) {
      setError('Please connect your wallet.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const form = e.currentTarget
      const members = addressIds
        .map((id) => {
          const address = (
            form.elements.namedItem(`address_${id}`) as HTMLInputElement
          )?.value?.trim()
          const weight = (
            form.elements.namedItem(`weight_${id}`) as HTMLInputElement
          )?.value
          return address ? { address, weight: weight || '1' } : null
        })
        .filter(Boolean) as Array<{ address: string; weight: string }>

      if (members.length === 0) {
        throw new Error('Add at least one member')
      }

      const threshold =
        (form.elements.namedItem('threshold') as HTMLInputElement)?.value || '1'
      const votingPeriod =
        (form.elements.namedItem('votingPeriod') as HTMLInputElement)?.value ||
        '86400'
      const metadata =
        (form.elements.namedItem('metadata') as HTMLInputElement)?.value || ''
      const groupPolicyAsAdmin = (
        form.elements.namedItem('groupPolicyAsAdmin') as HTMLInputElement
      )?.checked

      const msg = buildCreateGroupWithPolicyMsg({
        admin: walletAddress,
        members,
        groupMetadata: metadata,
        groupPolicyMetadata: metadata,
        groupPolicyAsAdmin,
        threshold,
        votingPeriodSeconds: votingPeriod,
        minExecutionPeriodSeconds: 0,
      })

      const result = await signingClient.signAndBroadcast(
        walletAddress,
        [msg],
        GROUP_GAS_MULTIPLIER
      )
      if (isDeliverTxFailure(result)) {
        throw new Error(result.rawLog)
      }

      setTxHash(result.transactionHash)
      const policy = extractGroupPolicyAddress(result)
      if (policy) {
        router.push(`/group/${policy}`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || String(err))
    }
    setLoading(false)
  }

  return (
    <WalletLoader>
      <div className="text-center container mx-auto max-w-lg">
        <h1 className="text-5xl font-bold mb-2">New x/group</h1>
        <p className="text-base-content/70 mb-8">
          Create a group with threshold decision policy (SDK module)
        </p>
        <form className="container mx-auto max-w-lg mb-8" onSubmit={handleSubmit}>
          <div className="w-full my-4">
            <label className="text-left font-bold block w-full pb-2">
              Metadata
            </label>
            <input
              className="block box-border m-0 w-full rounded input input-bordered focus:input-primary font-mono"
              type="text"
              name="metadata"
              placeholder="foundation / ops group"
              size={45}
            />
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr>
                <th className="text-left">Address</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {addressIds.map((idx) => (
                <AddressRow
                  key={idx}
                  idx={idx}
                  readOnly={false}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={onAdd}
            className="btn btn-outline btn-sm mb-6"
          >
            + Add member
          </button>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-left font-bold block w-full pb-2">
                Threshold
              </label>
              <input
                className="input input-bordered w-full font-mono"
                type="text"
                name="threshold"
                defaultValue="1"
              />
            </div>
            <div>
              <label className="text-left font-bold block w-full pb-2">
                Voting period (sec)
              </label>
              <input
                className="input input-bordered w-full font-mono"
                type="number"
                name="votingPeriod"
                defaultValue={86400}
                min={1}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input
              type="checkbox"
              name="groupPolicyAsAdmin"
              className="checkbox checkbox-primary"
              defaultChecked
            />
            <span className="text-left">
              Group policy as admin (self-owned policy)
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create group + policy'}
          </button>
        </form>

        {error && <LineAlert variant="error" msg={error} className="mb-4" />}
        {txHash && (
          <LineAlert
            variant="success"
            msg={`Tx: ${txHash}`}
            className="mb-4"
          />
        )}
      </div>
    </WalletLoader>
  )
}

export default CreateGroup
