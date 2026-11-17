import { isDeliverTxFailure } from '@cosmjs/stargate'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import LineAlert from 'components/LineAlert'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  GroupProposal,
  GroupProposalHistory,
  GroupVote,
  queryProposal,
  queryProposalHistory,
  queryVoteHistory,
  queryVotesByProposal,
} from 'services/groupLcd'
import { users } from 'util/constants'
import { decodeProto } from 'util/conversion'
import {
  GROUP_GAS_MULTIPLIER,
  VoteOption,
  buildExecMsg,
  buildVoteMsg,
} from 'util/groupTx'

function normalizeOption(option: string): string {
  const o = (option || '').toUpperCase()
  if (o.includes('YES')) return 'yes'
  if (o.includes('ABSTAIN')) return 'abstain'
  if (o.includes('NO_WITH_VETO') || o.includes('VETO')) return 'veto'
  if (o.includes('NO')) return 'no'
  return option
}

const GroupProposalPage: NextPage = () => {
  const router = useRouter()
  const policyAddress = router.query.policyAddress as string
  const proposalId = router.query.proposalId as string
  const { walletAddress, signingClient } = useSigningClient()

  const [proposal, setProposal] = useState<
    GroupProposal | GroupProposalHistory | null
  >(null)
  const [votes, setVotes] = useState<GroupVote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!proposalId) return
    setLoading(true)
    setError('')
    const loadLive = async () => {
      const [p, v] = await Promise.all([
        queryProposal(proposalId),
        queryVotesByProposal(proposalId),
      ])
      setProposal(p.proposal)
      setVotes(v.votes || [])
    }
    const loadHistory = async () => {
      const [history, voteTxs] = await Promise.all([
        queryProposalHistory(policyAddress),
        queryVoteHistory(proposalId),
      ])
      const h = history.find((x) => x.id === String(proposalId))
      if (!h) throw new Error(`Proposal #${proposalId} not found`)
      // With EXEC_TRY, proposers' YES votes are cast inside MsgSubmitProposal.
      const implicit: GroupVote[] = (h.exec_mode || '').includes('TRY')
        ? h.proposers.map((voter) => ({
            proposal_id: h.id,
            voter,
            option: 'VOTE_OPTION_YES',
            metadata: '',
            submit_time: h.submit_time,
          }))
        : []
      const seen = new Set<string>()
      setProposal(h)
      setVotes(
        [...implicit, ...voteTxs].filter((v) =>
          seen.has(v.voter) ? false : (seen.add(v.voter), true)
        )
      )
    }
    loadLive()
      .catch((err) => {
        if (!/not found/i.test(err.message || '')) throw err
        return loadHistory()
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false))
  }, [proposalId, policyAddress, refresh])

  const history =
    proposal && 'pruned' in proposal ? (proposal as GroupProposalHistory) : null

  const decodedMessages = (() => {
    try {
      return JSON.stringify(
        (proposal?.messages || []).map((m) => decodeProto(m as any)),
        null,
        2
      )
    } catch {
      return JSON.stringify(proposal?.messages || [], null, 2)
    }
  })()

  const alreadyVoted = votes.some((v) => v.voter === walletAddress)
  const status = (proposal?.status || '').toUpperCase()
  const exec = (proposal?.executor_result || '').toUpperCase()
  const isOpen = status.includes('SUBMITTED')
  const canExec =
    status.includes('ACCEPTED') && !exec.includes('SUCCESS') && !exec.includes('FAILURE')

  const broadcast = async (msg: Parameters<NonNullable<typeof signingClient>['signAndBroadcast']>[1][0]) => {
    if (!signingClient || !walletAddress) {
      setError('Please connect your wallet.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await signingClient.signAndBroadcast(
        walletAddress,
        [msg],
        GROUP_GAS_MULTIPLIER
      )
      if (isDeliverTxFailure(result)) {
        throw new Error(result.rawLog)
      }
      setTxHash(result.transactionHash)
      setRefresh((n) => n + 1)
    } catch (err: any) {
      console.error(err)
      setError(err.message || String(err))
    }
    setLoading(false)
  }

  const handleVote = (option: VoteOption) =>
    broadcast(
      buildVoteMsg({
        proposalId,
        voter: walletAddress,
        option,
      })
    )

  const handleExec = () =>
    broadcast(
      buildExecMsg({
        proposalId,
        executor: walletAddress,
      })
    )

  return (
    <WalletLoader loading={loading && !proposal}>
      <div className="container mx-auto max-w-2xl px-4">
        <button
          className="btn btn-ghost btn-sm mb-4"
          onClick={() => router.push(`/group/${policyAddress}`)}
        >
          {'< Proposals'}
        </button>

        {proposal && (
          <>
            <h1 className="text-3xl font-bold mb-2">
              #{proposal.id} {proposal.title || proposal.metadata}
            </h1>
            <p className="opacity-70 mb-4">{proposal.summary}</p>
            <div className="card mb-4">
              <div className="card-body p-3 text-sm font-mono space-y-1 break-all">
                {history && (
                  <div className="opacity-60">
                    Pruned from chain state; reconstructed from tx history.
                  </div>
                )}
                {!history && <div>status: {proposal.status}</div>}
                <div>executor_result: {proposal.executor_result}</div>
                {history?.exec_logs && (
                  <div className="text-error">exec logs: {history.exec_logs}</div>
                )}
                {history && (
                  <>
                    <div>
                      submitted:{' '}
                      {history.submit_time
                        ? new Date(history.submit_time).toLocaleString()
                        : '—'}{' '}
                      (height {history.submit_height}, tx {history.submit_txhash})
                    </div>
                    {history.exec_txhash && (
                      <div>
                        executed:{' '}
                        {history.exec_time
                          ? new Date(history.exec_time).toLocaleString()
                          : '—'}{' '}
                        (tx {history.exec_txhash})
                      </div>
                    )}
                  </>
                )}
                <div>
                  voting_period_end:{' '}
                  {proposal.voting_period_end
                    ? new Date(proposal.voting_period_end).toLocaleString()
                    : '—'}
                </div>
                {proposal.final_tally_result && (
                  <div>
                    tally yes={proposal.final_tally_result.yes_count} no=
                    {proposal.final_tally_result.no_count} abstain=
                    {proposal.final_tally_result.abstain_count}
                  </div>
                )}
              </div>
            </div>

            <h2 className="font-bold mb-2">Messages</h2>
            <ReactCodeMirror
              value={decodedMessages}
              height="220px"
              editable={false}
              extensions={[json(), EditorView.lineWrapping]}
              className="mb-4"
            />

            <h2 className="font-bold mb-2">Votes</h2>
            <div className="mb-4">
              {votes.length === 0 && (
                <div className="opacity-60 text-sm">No votes yet</div>
              )}
              {votes.map((v) => {
                const opt = normalizeOption(v.option)
                const variant =
                  opt === 'yes' ? 'success' : ('error' as const)
                let voter = v.voter
                if (voter === walletAddress) voter = 'You (' + voter + ')'
                else if (users[voter]) voter = users[voter] + ' (' + voter + ')'
                return (
                  <LineAlert
                    key={v.voter}
                    className="mt-2"
                    variant={variant}
                    msg={`${voter} voted ${opt}`}
                    link={`https://oraiscan.io/Oraichain/account/${v.voter}`}
                  />
                )
              })}
            </div>

            {isOpen && !alreadyVoted && (
              <div className="flex gap-3 mb-4">
                <button
                  className="btn btn-success flex-1"
                  disabled={loading}
                  onClick={() => handleVote(VoteOption.VOTE_OPTION_YES)}
                >
                  Vote YES
                </button>
                <button
                  className="btn btn-error flex-1"
                  disabled={loading}
                  onClick={() => handleVote(VoteOption.VOTE_OPTION_NO)}
                >
                  Vote NO
                </button>
                <button
                  className="btn btn-outline flex-1"
                  disabled={loading}
                  onClick={() => handleVote(VoteOption.VOTE_OPTION_ABSTAIN)}
                >
                  Abstain
                </button>
              </div>
            )}

            {canExec && (
              <button
                className="btn btn-primary w-full mb-4"
                disabled={loading}
                onClick={handleExec}
              >
                Execute proposal
              </button>
            )}
          </>
        )}

        {error && <LineAlert variant="error" msg={error} className="mb-4" />}
        {txHash && (
          <LineAlert variant="success" msg={`Tx: ${txHash}`} className="mb-4" />
        )}
      </div>
    </WalletLoader>
  )
}

export default GroupProposalPage
