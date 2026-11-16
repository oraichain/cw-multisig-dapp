import { EncodeObject } from '@cosmjs/proto-signing'
import { isDeliverTxFailure } from '@cosmjs/stargate'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import LineAlert from 'components/LineAlert'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useMemo, useState } from 'react'
import {
  GROUP_GAS_MULTIPLIER,
  buildAddBlacklistMsg,
  buildRemoveBlacklistAndRecoverMsg,
  buildRemoveBlacklistMsg,
  buildSubmitProposalMsg,
  parseAnyMessagesJson,
} from 'util/groupTx'

type MsgKind =
  | 'add_blacklist'
  | 'remove_blacklist'
  | 'remove_blacklist_recover'
  | 'custom'

const CreateGroupProposal: NextPage = () => {
  const router = useRouter()
  const policyAddress = router.query.policyAddress as string
  const { walletAddress, signingClient } = useSigningClient()
  const [kind, setKind] = useState<MsgKind>('add_blacklist')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [target, setTarget] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [customJson, setCustomJson] = useState(
    JSON.stringify(
      [
        {
          '@type': '/cosmwasm.txfees.v1.MsgAddBlacklist',
          authority: policyAddress || '<group_policy_address>',
          address: '<orai1...>',
        },
      ],
      null,
      2
    )
  )
  const [tryExec, setTryExec] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  const exampleAuthority = useMemo(
    () => policyAddress || '<group_policy_address>',
    [policyAddress]
  )
  const foundationPolicy = process.env.NEXT_PUBLIC_FOUNDATION_GROUP_POLICY
  const notFoundation =
    kind !== 'custom' &&
    !!foundationPolicy &&
    !!policyAddress &&
    policyAddress !== foundationPolicy

  const buildMessages = (): EncodeObject[] => {
    if (kind === 'custom') {
      return parseAnyMessagesJson(customJson)
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
              onChange={(e) => setKind(e.target.value as MsgKind)}
            >
              <option value="add_blacklist">MsgAddBlacklist</option>
              <option value="remove_blacklist">MsgRemoveBlacklist</option>
              <option value="remove_blacklist_recover">
                MsgRemoveBlacklistAndRecover
              </option>
              <option value="custom">Custom Any JSON</option>
            </select>
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

          {kind !== 'custom' && (
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
                {notFoundation && (
                  <p className="text-xs text-warning mt-1 break-all">
                    This policy is not the foundation policy ({foundationPolicy}
                    ). The chain will reject blacklist messages from it at
                    execution.
                  </p>
                )}
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
                onChange={(v) => setCustomJson(v)}
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
