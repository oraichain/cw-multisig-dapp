import { EncodeObject } from '@cosmjs/proto-signing'
import { isDeliverTxFailure } from '@cosmjs/stargate'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import LineAlert from 'components/LineAlert'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  GroupInfo,
  GroupMember,
  GroupPolicyInfo,
  queryGroupInfo,
  queryGroupMembers,
  queryGroupPolicyInfo,
} from 'services/groupLcd'
import {
  GROUP_GAS_MULTIPLIER,
  buildAddBlacklistMsg,
  buildRemoveBlacklistAndRecoverMsg,
  buildRemoveBlacklistMsg,
  buildSubmitProposalMsg,
  buildUpdateDecisionPolicyMsg,
  buildUpdateGroupMembersMsg,
  parseAnyMessagesJson,
} from 'util/groupTx'

type MsgKind =
  | 'add_blacklist'
  | 'remove_blacklist'
  | 'remove_blacklist_recover'
  | 'update_members'
  | 'update_decision_policy'
  | 'custom'

// LCD renders durations as e.g. "86400s".
function durationToSeconds(d?: string): string {
  return d ? String(parseInt(d, 10) || 0) : ''
}

const BLACKLIST_KINDS: MsgKind[] = [
  'add_blacklist',
  'remove_blacklist',
  'remove_blacklist_recover',
]
type MemberRow = { address: string; weight: string }

const KIND_LABELS: Record<MsgKind, string> = {
  add_blacklist: 'MsgAddBlacklist',
  remove_blacklist: 'MsgRemoveBlacklist',
  remove_blacklist_recover: 'MsgRemoveBlacklistAndRecover',
  update_members: 'Add / remove members (MsgUpdateGroupMembers)',
  update_decision_policy:
    'Update threshold / voting period (MsgUpdateGroupPolicyDecisionPolicy)',
  custom: 'Custom Any JSON',
}

const CreateGroupProposal: NextPage = () => {
  const router = useRouter()
  const policyAddress = router.query.policyAddress as string
  const { walletAddress, signingClient } = useSigningClient()
  const [kind, setKind] = useState<MsgKind>('add_blacklist')
  const [kindTouched, setKindTouched] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [target, setTarget] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [customJson, setCustomJson] = useState('')
  const [customTouched, setCustomTouched] = useState(false)
  const [memberRows, setMemberRows] = useState<MemberRow[]>([
    { address: '', weight: '1' },
  ])
  const [removals, setRemovals] = useState<string[]>([])
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [policy, setPolicy] = useState<GroupPolicyInfo | null>(null)
  const [threshold, setThreshold] = useState('')
  const [votingPeriod, setVotingPeriod] = useState('')
  const [minExecPeriod, setMinExecPeriod] = useState('0')
  const [tryExec, setTryExec] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    if (!policyAddress) return
    queryGroupPolicyInfo(policyAddress)
      .then(async (res) => {
        setPolicy(res.info)
        const dp = res.info?.decision_policy as any
        setThreshold(dp?.threshold || '')
        setVotingPeriod(durationToSeconds(dp?.windows?.voting_period))
        setMinExecPeriod(
          durationToSeconds(dp?.windows?.min_execution_period) || '0'
        )
        const groupId = res.info?.group_id
        if (!groupId) return
        const [info, mem] = await Promise.all([
          queryGroupInfo(groupId),
          queryGroupMembers(groupId),
        ])
        setGroup(info.info)
        setMembers(mem.members || [])
      })
      .catch((err) => setError(err.message || String(err)))
  }, [policyAddress])

  const exampleAuthority = useMemo(
    () => policyAddress || '<group_policy_address>',
    [policyAddress]
  )
  const isBlacklist = BLACKLIST_KINDS.includes(kind)
  const foundationPolicy = process.env.NEXT_PUBLIC_FOUNDATION_GROUP_POLICY
  // Without the env var the foundation policy is unknown, so keep blacklist msgs available.
  const isFoundation = !foundationPolicy || policyAddress === foundationPolicy
  const policyIsAdmin = !!group && group.admin === policyAddress
  // Decision policy updates are authorized by the policy's own admin, not the group admin.
  const policySelfAdmin = !!policy && policy.admin === policyAddress
  const currentDecision = policy?.decision_policy as any
  const isThresholdPolicy = (currentDecision?.['@type'] || '').endsWith(
    'ThresholdDecisionPolicy'
  )
  const totalWeight = Number(group?.total_weight || 0)

  const availableKinds = useMemo<MsgKind[]>(
    () => [
      ...(isFoundation ? BLACKLIST_KINDS : []),
      ...(policyIsAdmin ? (['update_members'] as MsgKind[]) : []),
      ...(policySelfAdmin && isThresholdPolicy
        ? (['update_decision_policy'] as MsgKind[])
        : []),
      'custom',
    ],
    [isFoundation, policyIsAdmin, policySelfAdmin, isThresholdPolicy]
  )

  // Router query and group info load async; follow the default until the user picks a kind.
  useEffect(() => {
    if (!policyAddress) return
    if (!kindTouched || !availableKinds.includes(kind)) {
      setKind(availableKinds[0])
    }
  }, [policyAddress, availableKinds, kind, kindTouched])

  useEffect(() => {
    if (!policyAddress || customTouched) return
    const example = isFoundation
      ? {
          '@type': '/cosmwasm.txfees.v1.MsgAddBlacklist',
          authority: policyAddress,
          address: '<orai1...>',
        }
      : {
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          from_address: policyAddress,
          to_address: '<orai1...>',
          amount: [{ denom: 'orai', amount: '1' }],
        }
    setCustomJson(JSON.stringify([example], null, 2))
  }, [policyAddress, isFoundation, customTouched])

  const memberAddresses = members
    .map((m) => m.member?.address)
    .filter(Boolean) as string[]

  const updateMemberRow = (i: number, patch: Partial<MemberRow>) =>
    setMemberRows((rs) =>
      rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    )
  const toggleRemoval = (addr: string) =>
    setRemovals((rs) =>
      rs.includes(addr) ? rs.filter((a) => a !== addr) : [...rs, addr]
    )

  const memberUpdates = () => {
    const updates = [
      ...memberRows
        .filter((r) => r.address.trim())
        .map((r) => ({ address: r.address.trim(), weight: r.weight.trim() })),
      ...removals.map((address) => ({ address, weight: '0' })),
    ]
    if (updates.length === 0) {
      throw new Error('Add an address or mark a member for removal.')
    }
    for (const u of updates) {
      if (u.weight !== '0' && !(Number(u.weight) > 0)) {
        throw new Error(`Weight for ${u.address} must be a positive number`)
      }
    }
    const remaining = new Set(memberAddresses)
    for (const u of updates) {
      if (u.weight === '0') remaining.delete(u.address)
      else remaining.add(u.address)
    }
    if (remaining.size === 0) {
      throw new Error(
        'A group must keep at least one member. Add the new member in the same update before removing the last one.'
      )
    }
    return updates
  }

  const buildMessages = (): EncodeObject[] => {
    if (kind === 'custom') {
      return parseAnyMessagesJson(customJson)
    }
    if (kind === 'update_decision_policy') {
      if (!/^\d+$/.test(threshold.trim()) || Number(threshold) <= 0) {
        throw new Error('Threshold must be a positive integer')
      }
      if (!/^\d+$/.test(votingPeriod.trim()) || Number(votingPeriod) <= 0) {
        throw new Error('Voting period must be a positive number of seconds')
      }
      if (!/^\d+$/.test(minExecPeriod.trim())) {
        throw new Error('Min execution period must be a number of seconds')
      }
      return [
        buildUpdateDecisionPolicyMsg({
          admin: policyAddress,
          groupPolicyAddress: policyAddress,
          threshold: threshold.trim(),
          votingPeriodSeconds: votingPeriod.trim(),
          minExecutionPeriodSeconds: minExecPeriod.trim(),
        }),
      ]
    }
    if (kind === 'update_members') {
      if (!group) throw new Error('Group info not loaded yet')
      return [
        buildUpdateGroupMembersMsg({
          admin: policyAddress,
          groupId: group.id,
          updates: memberUpdates(),
        }),
      ]
    }
    if (!target.trim()) throw new Error('Target address is required')
    if (kind === 'add_blacklist') {
      return [buildAddBlacklistMsg(policyAddress, target.trim())]
    }
    if (kind === 'remove_blacklist') {
      return [buildRemoveBlacklistMsg(policyAddress, target.trim())]
    }
    if (!toAddress.trim()) throw new Error('Recover to_address is required')
    return [
      buildRemoveBlacklistAndRecoverMsg(
        policyAddress,
        target.trim(),
        toAddress.trim()
      ),
    ]
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!signingClient || !walletAddress) {
      setError('Please connect your wallet.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const messages = buildMessages()
      const msg = buildSubmitProposalMsg({
        groupPolicyAddress: policyAddress,
        proposers: [walletAddress],
        title: title || `Proposal (${kind})`,
        summary: summary || title || kind,
        messages,
        tryExec,
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

      let proposalId: string | null = null
      for (const ev of result.events || []) {
        if (
          ev.type === 'cosmos.group.v1.EventSubmitProposal' ||
          ev.type === 'proposal'
        ) {
          const attr = ev.attributes.find(
            (a) => a.key === 'proposal_id' || a.key === 'id'
          )
          if (attr?.value) {
            proposalId = attr.value.replace(/^"|"$/g, '')
            break
          }
        }
      }
      if (proposalId) {
        router.push(`/group/${policyAddress}/${proposalId}`)
      } else {
        router.push(`/group/${policyAddress}`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || String(err))
    }
    setLoading(false)
  }

  return (
    <WalletLoader>
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-3xl font-bold mb-2">New group proposal</h1>
        <p className="font-mono text-sm opacity-70 mb-6 break-all">
          policy: {policyAddress}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold block mb-1">Message type</label>
            <select
              className="select select-bordered w-full"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as MsgKind)
                setKindTouched(true)
                setTarget('')
              }}
            >
              {availableKinds.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
            {group && (!isFoundation || !policyIsAdmin) && (
              <p className="text-xs opacity-60 mt-1 break-all">
                {!isFoundation &&
                  'Blacklist messages are only available on the foundation policy. '}
                {!policyIsAdmin &&
                  `Member messages are unavailable: the group admin is ${group.admin}, not this policy.`}
              </p>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">Title</label>
            <input
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add blacklist …"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Summary</label>
            <input
              className="input input-bordered w-full"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {kind === 'update_members' && (
            <div className="space-y-3">
              {members.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold block mb-1">Remove</label>
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
                        <span className="truncate">
                          {addr} (weight {m.member?.weight})
                        </span>
                      </label>
                    )
                  })}
                  {removals.includes(walletAddress) && (
                    <p className="text-xs text-warning">
                      You are removing yourself from the group.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-bold block mb-1">
                  Add / change weight
                </label>
                {memberRows.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input input-bordered flex-1 font-mono"
                      placeholder="orai1..."
                      value={r.address}
                      onChange={(e) =>
                        updateMemberRow(i, { address: e.target.value })
                      }
                    />
                    <input
                      className="input input-bordered w-24 font-mono"
                      type="number"
                      min={1}
                      value={r.weight}
                      onChange={(e) =>
                        updateMemberRow(i, { weight: e.target.value })
                      }
                    />
                    {memberRows.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          setMemberRows((rs) => rs.filter((_, idx) => idx !== i))
                        }
                      >
                        &#10008;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() =>
                    setMemberRows((rs) => [...rs, { address: '', weight: '1' }])
                  }
                >
                  + Add row
                </button>
                <p className="text-xs opacity-60">
                  An existing member address here updates its weight.
                </p>
              </div>
              <p className="text-xs opacity-60 break-all">
                admin will be set to {exampleAuthority} (group #{group?.id ?? '…'})
              </p>
              <p className="text-xs opacity-60">
                Executing this changes the group version, which aborts other
                open proposals of this group.
              </p>
            </div>
          )}

          {kind === 'update_decision_policy' && (
            <div className="space-y-2">
              <p className="text-xs opacity-70 font-mono break-all">
                current: threshold {currentDecision?.threshold ?? '—'}, voting{' '}
                {currentDecision?.windows?.voting_period ?? '—'}, min exec{' '}
                {currentDecision?.windows?.min_execution_period ?? '—'} (total
                weight {group?.total_weight ?? '—'})
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Threshold</label>
                  <input
                    className="input input-bordered w-full font-mono"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Voting (sec)</label>
                  <input
                    className="input input-bordered w-full font-mono"
                    value={votingPeriod}
                    onChange={(e) => setVotingPeriod(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Min exec (sec)</label>
                  <input
                    className="input input-bordered w-full font-mono"
                    value={minExecPeriod}
                    onChange={(e) => setMinExecPeriod(e.target.value)}
                  />
                </div>
              </div>
              {totalWeight > 0 && Number(threshold) > totalWeight && (
                <p className="text-xs text-warning">
                  Threshold is above the total weight ({totalWeight}); every
                  member will have to vote YES.
                </p>
              )}
              <p className="text-xs opacity-60">
                Executing this bumps the policy version, which aborts other open
                proposals of this policy.
              </p>
            </div>
          )}

          {isBlacklist && (
            <>
              <div>
                <label className="font-bold block mb-1">
                  Target address (blacklist)
                </label>
                <input
                  className="input input-bordered w-full font-mono"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="orai1..."
                />
                <p className="text-xs opacity-60 mt-1">
                  authority will be set to {exampleAuthority}
                </p>
                {target.trim() && target.trim() === walletAddress && (
                  <p className="text-xs text-warning mt-1">
                    You are targeting your own wallet: once blacklisted it can
                    no longer send transactions.
                  </p>
                )}
              </div>
              {kind === 'remove_blacklist_recover' && (
                <div>
                  <label className="font-bold block mb-1">
                    Recover to_address
                  </label>
                  <input
                    className="input input-bordered w-full font-mono"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="orai1..."
                  />
                </div>
              )}
            </>
          )}

          {kind === 'custom' && (
            <div>
              <label className="font-bold block mb-1">
                Messages JSON (array of Any)
              </label>
              <ReactCodeMirror
                value={customJson}
                height="280px"
                extensions={[json(), EditorView.lineWrapping]}
                onChange={(v) => {
                  setCustomJson(v)
                  setCustomTouched(true)
                }}
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={tryExec}
              onChange={(e) => setTryExec(e.target.checked)}
            />
            <span>Try execute immediately (EXEC_TRY)</span>
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit proposal'}
          </button>
        </form>

        {error && <LineAlert variant="error" msg={error} className="mt-4" />}
        {txHash && (
          <LineAlert variant="success" msg={`Tx: ${txHash}`} className="mt-4" />
        )}
      </div>
    </WalletLoader>
  )
}

export default CreateGroupProposal
