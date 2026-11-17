import { EncodeObject, Registry } from '@cosmjs/proto-signing'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { Duration } from 'cosmjs-types/google/protobuf/duration'
import {
  MsgCreateGroupWithPolicy,
  MsgExec,
  MsgSubmitProposal,
  MsgUpdateGroupMembers,
  MsgUpdateGroupPolicyDecisionPolicy,
  MsgVote,
  Exec,
} from 'cosmjs-types/cosmos/group/v1/tx'
import {
  ThresholdDecisionPolicy,
  VoteOption,
} from 'cosmjs-types/cosmos/group/v1/types'
import { Long } from 'cosmjs-types/helpers'
import { customRegistry } from 'util/conversion'
import {
  MsgAddBlacklist,
  MsgRemoveBlacklist,
  MsgRemoveBlacklistAndRecover,
} from 'util/txfeesProto'

// x/group txs use ~1.4x their simulated gas (e.g. member removal), above CosmJS 'auto'.
export const GROUP_GAS_MULTIPLIER = 1.6

export function encodeAsAny(msg: EncodeObject, registry: Registry = customRegistry): Any {
  return Any.fromPartial({
    typeUrl: msg.typeUrl,
    value: registry.encode(msg),
  })
}

export function parseDurationSeconds(input: string | number): Duration {
  const seconds =
    typeof input === 'number'
      ? input
      : input.endsWith('s')
        ? parseInt(input.slice(0, -1), 10)
        : parseInt(input, 10)
  return Duration.fromPartial({
    seconds: Long.fromNumber(Number.isFinite(seconds) ? seconds : 0),
    nanos: 0,
  })
}

function thresholdPolicyAny(params: {
  threshold?: string
  votingPeriodSeconds?: string | number
  minExecutionPeriodSeconds?: string | number
}): Any {
  const policy = ThresholdDecisionPolicy.fromPartial({
    threshold: params.threshold || '1',
    windows: {
      votingPeriod: parseDurationSeconds(params.votingPeriodSeconds ?? 86400),
      minExecutionPeriod: parseDurationSeconds(
        params.minExecutionPeriodSeconds ?? 0
      ),
    },
  })
  return Any.fromPartial({
    typeUrl: '/cosmos.group.v1.ThresholdDecisionPolicy',
    value: ThresholdDecisionPolicy.encode(policy).finish(),
  })
}

export function buildCreateGroupWithPolicyMsg(params: {
  admin: string
  members: Array<{ address: string; weight: string; metadata?: string }>
  groupMetadata?: string
  groupPolicyMetadata?: string
  groupPolicyAsAdmin?: boolean
  threshold?: string
  votingPeriodSeconds?: string | number
  minExecutionPeriodSeconds?: string | number
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicy',
    value: MsgCreateGroupWithPolicy.fromPartial({
      admin: params.admin,
      members: params.members.map((m) => ({
        address: m.address.trim(),
        weight: String(m.weight),
        metadata: m.metadata || '',
      })),
      groupMetadata: params.groupMetadata || '',
      groupPolicyMetadata: params.groupPolicyMetadata || '',
      groupPolicyAsAdmin: !!params.groupPolicyAsAdmin,
      decisionPolicy: thresholdPolicyAny(params),
    }),
  }
}

export function buildUpdateDecisionPolicyMsg(params: {
  admin: string
  groupPolicyAddress: string
  threshold: string
  votingPeriodSeconds: string | number
  minExecutionPeriodSeconds?: string | number
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy',
    value: MsgUpdateGroupPolicyDecisionPolicy.fromPartial({
      admin: params.admin,
      groupPolicyAddress: params.groupPolicyAddress,
      decisionPolicy: thresholdPolicyAny(params),
    }),
  }
}

/** weight "0" removes the member. */
export function buildUpdateGroupMembersMsg(params: {
  admin: string
  groupId: string | number
  updates: Array<{ address: string; weight: string; metadata?: string }>
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembers',
    value: MsgUpdateGroupMembers.fromPartial({
      admin: params.admin,
      groupId: Long.fromString(String(params.groupId)),
      memberUpdates: params.updates.map((u) => ({
        address: u.address.trim(),
        weight: String(u.weight),
        metadata: u.metadata || '',
      })),
    }),
  }
}

export function buildSubmitProposalMsg(params: {
  groupPolicyAddress: string
  proposers: string[]
  title: string
  summary: string
  metadata?: string
  messages: EncodeObject[]
  tryExec?: boolean
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgSubmitProposal',
    value: MsgSubmitProposal.fromPartial({
      groupPolicyAddress: params.groupPolicyAddress,
      proposers: params.proposers,
      metadata: params.metadata || '',
      title: params.title,
      summary: params.summary,
      exec: params.tryExec ? Exec.EXEC_TRY : Exec.EXEC_UNSPECIFIED,
      messages: params.messages.map((m) => encodeAsAny(m)),
    }),
  }
}

export function buildVoteMsg(params: {
  proposalId: string | number
  voter: string
  option: VoteOption
  metadata?: string
  tryExec?: boolean
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgVote',
    value: MsgVote.fromPartial({
      proposalId: Long.fromString(String(params.proposalId)),
      voter: params.voter,
      option: params.option,
      metadata: params.metadata || '',
      exec: params.tryExec ? Exec.EXEC_TRY : Exec.EXEC_UNSPECIFIED,
    }),
  }
}

export function buildExecMsg(params: {
  proposalId: string | number
  executor: string
}): EncodeObject {
  return {
    typeUrl: '/cosmos.group.v1.MsgExec',
    value: MsgExec.fromPartial({
      proposalId: Long.fromString(String(params.proposalId)),
      executor: params.executor,
    }),
  }
}

export function buildAddBlacklistMsg(authority: string, address: string): EncodeObject {
  return {
    typeUrl: '/cosmwasm.txfees.v1.MsgAddBlacklist',
    value: (MsgAddBlacklist as any).fromPartial({
      authority,
      address,
    }),
  }
}

export function buildRemoveBlacklistMsg(
  authority: string,
  address: string
): EncodeObject {
  return {
    typeUrl: '/cosmwasm.txfees.v1.MsgRemoveBlacklist',
    value: (MsgRemoveBlacklist as any).fromPartial({
      authority,
      address,
    }),
  }
}

export function buildRemoveBlacklistAndRecoverMsg(
  authority: string,
  address: string,
  toAddress: string
): EncodeObject {
  return {
    typeUrl: '/cosmwasm.txfees.v1.MsgRemoveBlacklistAndRecover',
    value: (MsgRemoveBlacklistAndRecover as any).fromPartial({
      authority,
      address,
      toAddress,
    }),
  }
}

/** Parse JSON array of {type_url|@type, value} into EncodeObjects. */
// Proto JSON uses snake_case, but cosmjs-types fromPartial ignores keys that are not camelCase.
// Wasm `msg` payloads are opaque contract JSON and must keep their keys.
function camelizeKeys(v: any): any {
  if (Array.isArray(v)) return v.map(camelizeKeys)
  if (v && typeof v === 'object' && !(v instanceof Uint8Array)) {
    return Object.fromEntries(
      Object.entries(v).map(([k, val]) => [
        k.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase()),
        k === 'msg' ? val : camelizeKeys(val),
      ])
    )
  }
  return v
}

export function parseAnyMessagesJson(raw: string): EncodeObject[] {
  let parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) parsed = [parsed]
  return parsed.map((item: any) => {
    const typeUrl = item.type_url || item.typeUrl || item['@type']
    if (!typeUrl) throw new Error('each message needs type_url / @type')
    const value = item.value ?? (() => {
      const { type_url, typeUrl: _t, ['@type']: _a, ...rest } = item
      return rest
    })()
    const type = customRegistry.lookupType(typeUrl)
    if (!type) {
      throw new Error(
        `type ${typeUrl} is not registered in customRegistry — add it in util/conversion.ts`
      )
    }
    return {
      typeUrl,
      // @ts-ignore
      value: type.fromPartial(camelizeKeys(value)),
    }
  })
}

export { VoteOption, Exec }
