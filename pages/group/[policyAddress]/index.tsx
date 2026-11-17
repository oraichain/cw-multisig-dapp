import type { NextPage } from 'next'
import WalletLoader from 'components/WalletLoader'
import ProposalCard from 'components/ProposalCard'
import { useSigningClient } from 'contexts/cosmwasm'
import { PUBLIC_CHAIN_ID } from 'hooks/cosmwasm'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  GroupInfo,
  GroupMember,
  GroupPolicyInfo,
  GroupProposal,
  queryGroupInfo,
  queryGroupMembers,
  queryGroupPolicyInfo,
  queryProposalHistory,
  queryProposalsByGroupPolicy,
} from 'services/groupLcd'
import { users } from 'util/constants'

function mapGroupStatus(p: GroupProposal): string {
  const status = (p.status || '').toUpperCase()
  const exec = (p.executor_result || '').toUpperCase()
  if (exec.includes('SUCCESS')) return 'executed'
  if (exec.includes('FAILURE')) return 'rejected'
  if ((p as any).pruned) return 'closed'
  if (status.includes('ACCEPTED')) return 'passed'
  if (
    status.includes('REJECTED') ||
    status.includes('ABORTED') ||
    status.includes('WITHDRAWN')
  ) {
    return 'rejected'
  }
  return 'open'
}

const GroupHome: NextPage = () => {
  const router = useRouter()
  const policyAddress = router.query.policyAddress as string
  const { walletAddress } = useSigningClient()
  const [policy, setPolicy] = useState<GroupPolicyInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [proposals, setProposals] = useState<GroupProposal[]>([])
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!policyAddress) return
    setLoading(true)
    setError('')
    Promise.all([
      queryGroupPolicyInfo(policyAddress),
      queryProposalsByGroupPolicy(policyAddress),
      queryProposalHistory(policyAddress).catch((err) => {
        console.error('proposal history', err)
        return []
      }),
    ])
      .then(async ([policyRes, proposalsRes, history]) => {
        setPolicy(policyRes.info)
        const live = proposalsRes.proposals || []
        const liveIds = new Set(live.map((p) => p.id))
        setProposals(
          [...live, ...history.filter((h) => !liveIds.has(h.id))].sort(
            (a, b) => Number(b.id) - Number(a.id)
          )
        )
        if (policyRes.info?.group_id) {
          const [mem, info] = await Promise.all([
            queryGroupMembers(policyRes.info.group_id),
            queryGroupInfo(policyRes.info.group_id),
          ])
          setMembers(mem.members || [])
          setGroup(info.info)
        }
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false))
  }, [policyAddress])

  const isMember = members.some((m) => m.member?.address === walletAddress)
  const threshold =
    policy?.decision_policy?.threshold ||
    (policy?.decision_policy as any)?.value?.threshold

  return (
    <WalletLoader loading={loading && !policy}>
      <div className="flex flex-col w-96 max-w-full">
        <h1 className="text-left text-lg font-bold sm:text-3xl px-2 py-4">
          x/group policy
        </h1>
        <div className="card mb-4">
          <div className="card-body p-3 text-left text-sm font-mono break-all">
            <div>
              <span className="opacity-60">policy:</span> {policyAddress}
            </div>
            {policy && (
              <>
                <div>
                  <span className="opacity-60">group_id:</span>{' '}
                  {policy.group_id}
                </div>
                <div>
                  <span className="opacity-60">threshold:</span>{' '}
                  {threshold ?? '—'}
                </div>
                {group && (
                  <div>
                    <span className="opacity-60">group admin:</span>{' '}
                    {group.admin === policyAddress
                      ? 'this policy (changes via proposals)'
                      : group.admin}
                  </div>
                )}
                {policy.metadata && (
                  <div>
                    <span className="opacity-60">metadata:</span>{' '}
                    {policy.metadata}
                  </div>
                )}
              </>
            )}
            {error && <div className="text-error mt-2">{error}</div>}
          </div>
        </div>

        <h1 className="text-left text-lg font-bold sm:text-3xl px-2 py-4">
          Weight - Members
        </h1>
        <div className="w-full">
          {members.map((m) => {
            const addr = m.member?.address || ''
            let label = addr
            if (addr === walletAddress) label = 'You (' + addr + ')'
            else if (users[addr]) label = users[addr] + ' (' + addr + ')'
            return (
              <a
                key={addr}
                href={`https://oraiscan.io/${PUBLIC_CHAIN_ID}/account/${addr}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="card mb-4">
                  <div className="card-body p-2">
                    <div className="text-md truncate m-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 border-2 border-white rounded-full mr-4">
                        {m.member?.weight}
                      </span>
                      {label}
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col w-96 max-w-full px-2 py-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-lg font-bold sm:text-3xl">ID - Proposals</h1>
          {isMember && (
            <button
              className="btn btn-primary btn-sm text-lg"
              onClick={() => router.push(`/group/${policyAddress}/create`)}
            >
              + Create
            </button>
          )}
        </div>
      </div>
      <div className="w-96 max-w-full">
        {proposals.length === 0 && (
          <div className="text-center">
            No proposals found, please create a proposal.
          </div>
        )}
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            title={p.title || p.metadata || `Proposal #${p.id}`}
            id={p.id}
            status={mapGroupStatus(p)}
            expires_at={
              p.voting_period_end
                ? new Date(p.voting_period_end).toLocaleString()
                : p.submit_time
                ? new Date(p.submit_time).toLocaleString()
                : ''
            }
            slugAddress={policyAddress}
            href={`/group/${policyAddress}/${p.id}`}
          />
        ))}
      </div>
    </WalletLoader>
  )
}

export default GroupHome
