export const PUBLIC_REST_ENDPOINT = (
  process.env.NEXT_PUBLIC_CHAIN_REST_ENDPOINT || 'https://lcd.orai.io/'
).replace(/\/$/, '')

async function lcdGet<T>(path: string): Promise<T> {
  const url = `${PUBLIC_REST_ENDPOINT}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LCD ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

export type GroupInfo = {
  id: string
  admin: string
  metadata: string
  version: string
  total_weight: string
  created_at?: string
}

export type GroupMember = {
  group_id: string
  member?: {
    address: string
    weight: string
    metadata: string
    added_at?: string
  }
}

export type GroupPolicyInfo = {
  address: string
  group_id: string
  admin: string
  metadata: string
  version: string
  decision_policy?: {
    '@type'?: string
    type_url?: string
    threshold?: string
    percentage?: string
    windows?: {
      voting_period?: string
      min_execution_period?: string
    }
  }
  created_at?: string
}

export type GroupProposal = {
  id: string
  group_policy_address: string
  metadata: string
  proposers: string[]
  submit_time?: string
  group_version: string
  group_policy_version: string
  status: string
  final_tally_result?: {
    yes_count: string
    abstain_count: string
    no_count: string
    no_with_veto_count: string
  }
  voting_period_end?: string
  executor_result: string
  messages: Array<{ '@type'?: string; type_url?: string; value?: unknown } | Record<string, unknown>>
  title?: string
  summary?: string
}

export type GroupVote = {
  proposal_id: string
  voter: string
  option: string
  metadata: string
  submit_time?: string
}

export async function queryGroupPolicyInfo(address: string) {
  return lcdGet<{ info: GroupPolicyInfo }>(
    `/cosmos/group/v1/group_policy_info/${address}`
  )
}

export async function queryGroupInfo(groupId: string) {
  return lcdGet<{ info: GroupInfo }>(`/cosmos/group/v1/group_info/${groupId}`)
}

export async function queryGroupMembers(groupId: string, limit = 100) {
  return lcdGet<{ members: GroupMember[]; pagination?: { next_key?: string } }>(
    `/cosmos/group/v1/group_members/${groupId}?pagination.limit=${limit}`
  )
}

export async function queryProposalsByGroupPolicy(
  policyAddress: string,
  limit = 50
) {
  return lcdGet<{
    proposals: GroupProposal[]
    pagination?: { next_key?: string }
  }>(
    `/cosmos/group/v1/proposals_by_group_policy/${policyAddress}?pagination.limit=${limit}&pagination.reverse=true`
  )
}

export async function queryProposal(proposalId: string) {
  return lcdGet<{ proposal: GroupProposal }>(
    `/cosmos/group/v1/proposal/${proposalId}`
  )
}

export async function queryVotesByProposal(proposalId: string, limit = 100) {
  return lcdGet<{ votes: GroupVote[] }>(
    `/cosmos/group/v1/votes_by_proposal/${proposalId}?pagination.limit=${limit}`
  )
}

// x/group deletes a proposal from state once it is executed successfully or
// pruned after its voting window, so history is rebuilt from indexed txs.

type TxEventAttr = { key: string; value: string }
type TxEvent = { type: string; attributes: TxEventAttr[] }
type TxResponse = {
  height: string
  txhash: string
  code: number
  timestamp: string
  tx: { body: { messages: Array<Record<string, any>> } }
  events: TxEvent[]
}

async function searchTxs(query: string, limit = 100): Promise<TxResponse[]> {
  const res = await lcdGet<{ tx_responses?: TxResponse[] }>(
    `/cosmos/tx/v1beta1/txs?query=${encodeURIComponent(
      query
    )}&pagination.limit=${limit}&order_by=ORDER_BY_DESC`
  )
  return (res.tx_responses || []).filter((t) => t.code === 0)
}

function attrValue(e: TxEvent, key: string): string | undefined {
  const a = e.attributes.find((x) => x.key === key)
  if (!a) return undefined
  try {
    const v = JSON.parse(a.value)
    return typeof v === 'string' ? v : String(v)
  } catch {
    return a.value
  }
}

function eventsOf(tx: TxResponse, type: string) {
  return tx.events.filter((e) => e.type === type)
}

export type GroupProposalHistory = GroupProposal & {
  exec_mode?: string
  submit_height: string
  submit_txhash: string
  exec_logs?: string
  exec_txhash?: string
  exec_time?: string
  pruned: true
}

export async function queryProposalHistory(
  policyAddress?: string
): Promise<GroupProposalHistory[]> {
  const [submits, execs] = await Promise.all([
    searchTxs("message.action='/cosmos.group.v1.MsgSubmitProposal'"),
    searchTxs('cosmos.group.v1.EventExec.proposal_id EXISTS'),
  ])

  const execById = new Map<
    string,
    { result: string; logs?: string; txhash: string; time: string }
  >()
  // Oldest first so the latest exec attempt for a proposal wins.
  for (const tx of [...execs].reverse()) {
    for (const e of eventsOf(tx, 'cosmos.group.v1.EventExec')) {
      const id = attrValue(e, 'proposal_id')
      if (!id) continue
      execById.set(id, {
        result: attrValue(e, 'result') || '',
        logs: attrValue(e, 'logs'),
        txhash: tx.txhash,
        time: tx.timestamp,
      })
    }
  }

  const out: GroupProposalHistory[] = []
  for (const tx of submits) {
    const msgs = tx.tx.body.messages
    for (const e of eventsOf(tx, 'cosmos.group.v1.EventSubmitProposal')) {
      const id = attrValue(e, 'proposal_id')
      if (!id) continue
      const idx = Number(attrValue(e, 'msg_index') ?? 0)
      const msg =
        msgs[idx]?.['@type'] === '/cosmos.group.v1.MsgSubmitProposal'
          ? msgs[idx]
          : msgs.find((m) => m['@type'] === '/cosmos.group.v1.MsgSubmitProposal')
      if (!msg) continue
      if (policyAddress && msg.group_policy_address !== policyAddress) continue
      const exec = execById.get(id)
      out.push({
        id,
        group_policy_address: msg.group_policy_address,
        metadata: msg.metadata || '',
        proposers: msg.proposers || [],
        title: msg.title,
        summary: msg.summary,
        messages: msg.messages || [],
        exec_mode: msg.exec,
        submit_time: tx.timestamp,
        submit_height: tx.height,
        submit_txhash: tx.txhash,
        group_version: '',
        group_policy_version: '',
        status: exec ? 'PROPOSAL_STATUS_ACCEPTED' : 'PROPOSAL_STATUS_UNSPECIFIED',
        executor_result: exec?.result || 'PROPOSAL_EXECUTOR_RESULT_NOT_RUN',
        exec_logs: exec?.logs,
        exec_txhash: exec?.txhash,
        exec_time: exec?.time,
        pruned: true,
      })
    }
  }
  return out.sort((a, b) => Number(b.id) - Number(a.id))
}

export async function queryVoteHistory(proposalId: string): Promise<GroupVote[]> {
  const txs = await searchTxs("message.action='/cosmos.group.v1.MsgVote'")
  const votes: GroupVote[] = []
  for (const tx of txs) {
    for (const m of tx.tx.body.messages) {
      if (m['@type'] !== '/cosmos.group.v1.MsgVote') continue
      if (String(m.proposal_id) !== String(proposalId)) continue
      votes.push({
        proposal_id: String(m.proposal_id),
        voter: m.voter,
        option: m.option,
        metadata: m.metadata || '',
        submit_time: tx.timestamp,
      })
    }
  }
  return votes
}

export async function queryGroupsByMember(address: string) {
  return lcdGet<{
    groups: GroupInfo[]
    pagination?: { next_key?: string }
  }>(`/cosmos/group/v1/groups_by_member/${address}?pagination.limit=50`)
}
