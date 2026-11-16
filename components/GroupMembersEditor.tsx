import { isDeliverTxFailure } from '@cosmjs/stargate'
import LineAlert from 'components/LineAlert'
import { useSigningClient } from 'contexts/cosmwasm'
import { useState } from 'react'
import { GroupMember } from 'services/groupLcd'
import {
  GROUP_GAS_MULTIPLIER,
  buildSubmitProposalMsg,
  buildUpdateGroupMembersMsg,
} from 'util/groupTx'

type Row = { address: string; weight: string }

export default function GroupMembersEditor({
  groupId,
  groupAdmin,
  policyAddress,
  members,
  onDone,
}: {
  groupId: string
  groupAdmin: string
  policyAddress: string
  members: GroupMember[]
  onDone: () => void
}) {
  const { walletAddress, signingClient } = useSigningClient()
  const [rows, setRows] = useState<Row[]>([{ address: '', weight: '1' }])
  const [removals, setRemovals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  const isDirectAdmin = !!walletAddress && walletAddress === groupAdmin
  const isPolicyAdmin = groupAdmin === policyAddress
  const isMember = members.some((m) => m.member?.address === walletAddress)
  const canSubmit = isDirectAdmin || (isPolicyAdmin && isMember)

  if (!canSubmit) {
    return (
      <p className="text-sm opacity-60 px-2">
        Only the group admin ({groupAdmin}) can change members
        {isPolicyAdmin ? ' (via a member proposal)' : ''}.
      </p>
    )
  }

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const toggleRemoval = (addr: string) =>
    setRemovals((rs) =>
      rs.includes(addr) ? rs.filter((a) => a !== addr) : [...rs, addr]
    )

  const handleSubmit = async () => {
    if (!signingClient) {
      setError('Please connect your wallet.')
      return
    }
    const updates = [
      ...rows
        .filter((r) => r.address.trim())
        .map((r) => ({ address: r.address.trim(), weight: r.weight || '1' })),
      ...removals.map((address) => ({ address, weight: '0' })),
    ]
    if (updates.length === 0) {
      setError('Add an address or mark a member for removal.')
      return
    }
    const remaining = new Set(members.map((m) => m.member?.address))
    for (const u of updates) {
      if (u.weight === '0') remaining.delete(u.address)
      else remaining.add(u.address)
    }
    if (remaining.size === 0) {
      setError(
        'A group must keep at least one member. Add the new member in the same update before removing the last one.'
      )
      return
    }

    setLoading(true)
    setError('')
    try {
      const updateMsg = buildUpdateGroupMembersMsg({
        admin: groupAdmin,
        groupId,
        updates,
      })
      const msg = isDirectAdmin
        ? updateMsg
        : buildSubmitProposalMsg({
            groupPolicyAddress: policyAddress,
            proposers: [walletAddress],
            title: 'Update group members',
            summary: updates
              .map((u) =>
                u.weight === '0' ? `remove ${u.address}` : `set ${u.address}=${u.weight}`
              )
              .join(', '),
            messages: [updateMsg],
            tryExec: true,
          })

      const result = await signingClient.signAndBroadcast(
        walletAddress,
        [msg],
        GROUP_GAS_MULTIPLIER
      )
      if (isDeliverTxFailure(result)) throw new Error(result.rawLog)
      setTxHash(result.transactionHash)
      setRows([{ address: '', weight: '1' }])
      setRemovals([])
      onDone()
    } catch (err: any) {
      console.error(err)
      setError(err.message || String(err))
    }
    setLoading(false)
  }

  return (
    <div className="card mb-4">
      <div className="card-body p-3 space-y-3">
        <h2 className="font-bold">Manage members</h2>
        <p className="text-xs opacity-60">
          {isDirectAdmin
            ? 'You are the group admin: changes apply immediately.'
            : 'The policy is the group admin: this submits a proposal with your YES vote and executes it if the threshold is already met.'}{' '}
          Any open proposal is aborted once members change.
        </p>

        {members.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-semibold">Remove</div>
            {members.map((m) => {
              const addr = m.member?.address || ''
              return (
                <label
                  key={addr}
                  className="flex items-center gap-2 text-xs font-mono cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-error checkbox-sm"
                    checked={removals.includes(addr)}
                    onChange={() => toggleRemoval(addr)}
                  />
                  <span className="truncate">{addr}</span>
                </label>
              )
            })}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold">Add / change weight</div>
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input input-bordered input-sm flex-1 font-mono"
                placeholder="orai1..."
                value={r.address}
                onChange={(e) => updateRow(i, { address: e.target.value })}
              />
              <input
                className="input input-bordered input-sm w-20 font-mono"
                type="number"
                min={1}
                value={r.weight}
                onChange={(e) => updateRow(i, { weight: e.target.value })}
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                >
                  &#10008;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => setRows((rs) => [...rs, { address: '', weight: '1' }])}
          >
            + Add row
          </button>
        </div>

        <button
          className="btn btn-primary btn-sm w-full"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? 'Submitting…'
            : isDirectAdmin
              ? 'Update members'
              : 'Propose member update'}
        </button>

        {error && <LineAlert variant="error" msg={error} />}
        {txHash && <LineAlert variant="success" msg={`Tx: ${txHash}`} />}
      </div>
    </div>
  )
}
