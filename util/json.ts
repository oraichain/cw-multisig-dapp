import { JsonObject, fromBinary } from '@cosmjs/cosmwasm-stargate'

export const parseJSONRecursive = (value: JsonObject) => {
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
