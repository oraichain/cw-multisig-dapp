import { JsonObject, fromBinary } from '@cosmjs/cosmwasm-stargate'
import { Registry } from '@cosmjs/proto-signing'
import { defaultRegistryTypes } from '@cosmjs/stargate'

export const registry = new Registry(defaultRegistryTypes)

export const parseJSONRecursive = (value: JsonObject) => {
  const typeUrl = value.type_url || value.typeUrl
  if (typeUrl) {
    // decode proto
    return parseJSONRecursive(registry.decode({ typeUrl, value: value.value }))
  }
  for (const k in value) {
    if (typeof value[k] === 'string') {
      try {
        value[k] = fromBinary(value[k])
      } catch {}
    }
    if (typeof value[k] === 'object') parseJSONRecursive(value[k])
  }
  return value
}
