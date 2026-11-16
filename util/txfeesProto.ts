import { Writer, Reader } from 'protobufjs/minimal'

export type MsgAddBlacklistMsg = {
  authority: string
  address: string
}

export type MsgRemoveBlacklistMsg = {
  authority: string
  address: string
}

export type MsgRemoveBlacklistAndRecoverMsg = {
  authority: string
  address: string
  toAddress: string
}

function encodeStrings(
  fields: Array<{ tag: number; value?: string }>,
  writer: Writer = Writer.create()
): Writer {
  for (const { tag, value } of fields) {
    if (value !== undefined && value !== '') {
      writer.uint32(tag).string(value)
    }
  }
  return writer
}

export const MsgAddBlacklist = {
  typeUrl: '/cosmwasm.txfees.v1.MsgAddBlacklist',
  encode(
    message: MsgAddBlacklistMsg,
    writer: Writer = Writer.create()
  ): Writer {
    return encodeStrings(
      [
        { tag: 10, value: message.authority },
        { tag: 18, value: message.address },
      ],
      writer
    )
  },
  decode(input: Reader | Uint8Array, length?: number): MsgAddBlacklistMsg {
    const reader = input instanceof Reader ? input : new Reader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message: MsgAddBlacklistMsg = { authority: '', address: '' }
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string()
          break
        case 2:
          message.address = reader.string()
          break
        default:
          reader.skipType(tag & 7)
      }
    }
    return message
  },
  fromPartial(object: Partial<MsgAddBlacklistMsg>): MsgAddBlacklistMsg {
    return {
      authority: object.authority ?? '',
      address: object.address ?? '',
    }
  },
}

export const MsgRemoveBlacklist = {
  typeUrl: '/cosmwasm.txfees.v1.MsgRemoveBlacklist',
  encode(
    message: MsgRemoveBlacklistMsg,
    writer: Writer = Writer.create()
  ): Writer {
    return encodeStrings(
      [
        { tag: 10, value: message.authority },
        { tag: 18, value: message.address },
      ],
      writer
    )
  },
  decode(input: Reader | Uint8Array, length?: number): MsgRemoveBlacklistMsg {
    const reader = input instanceof Reader ? input : new Reader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message: MsgRemoveBlacklistMsg = { authority: '', address: '' }
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string()
          break
        case 2:
          message.address = reader.string()
          break
        default:
          reader.skipType(tag & 7)
      }
    }
    return message
  },
  fromPartial(object: Partial<MsgRemoveBlacklistMsg>): MsgRemoveBlacklistMsg {
    return {
      authority: object.authority ?? '',
      address: object.address ?? '',
    }
  },
}

export const MsgRemoveBlacklistAndRecover = {
  typeUrl: '/cosmwasm.txfees.v1.MsgRemoveBlacklistAndRecover',
  encode(
    message: MsgRemoveBlacklistAndRecoverMsg,
    writer: Writer = Writer.create()
  ): Writer {
    return encodeStrings(
      [
        { tag: 10, value: message.authority },
        { tag: 18, value: message.address },
        { tag: 26, value: message.toAddress },
      ],
      writer
    )
  },
  decode(
    input: Reader | Uint8Array,
    length?: number
  ): MsgRemoveBlacklistAndRecoverMsg {
    const reader = input instanceof Reader ? input : new Reader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message: MsgRemoveBlacklistAndRecoverMsg = {
      authority: '',
      address: '',
      toAddress: '',
    }
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string()
          break
        case 2:
          message.address = reader.string()
          break
        case 3:
          message.toAddress = reader.string()
          break
        default:
          reader.skipType(tag & 7)
      }
    }
    return message
  },
  fromPartial(
    object: Partial<MsgRemoveBlacklistAndRecoverMsg>
  ): MsgRemoveBlacklistAndRecoverMsg {
    return {
      authority: object.authority ?? '',
      address: object.address ?? '',
      toAddress: object.toAddress ?? (object as any).to_address ?? '',
    }
  },
}
