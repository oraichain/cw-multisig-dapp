import { Registry } from '@cosmjs/proto-signing';
import { fromAscii } from '@cosmjs/encoding';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { JsonObject, fromBinary, wasmTypes } from '@cosmjs/cosmwasm-stargate';

const truncDecimals = 6;
const atomic = 10 ** truncDecimals;

export const validateNumber = (amount) => {
  if (typeof amount === 'string') return validateNumber(Number(amount));
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return 0;
  return amount;
};

// decimals always >= 6
export const toAmount = (amount, decimals = 6) => {
  const validatedAmount = validateNumber(amount);
  return (
    window.BigInt(Math.trunc(validatedAmount * atomic)) *
    window.BigInt(10 ** (decimals - truncDecimals))
  ).toString();
};

export function convertMicroDenomToDenom(amount: number | string) {
  if (typeof amount === 'string') {
    amount = Number(amount);
  }
  amount = amount / 1000000;
  return isNaN(amount) ? 0 : amount;
}

export function convertDenomToMicroDenom(amount: number | string): string {
  if (typeof amount === 'string') {
    amount = Number(amount);
  }
  amount = amount * 1000000;
  return isNaN(amount) ? '0' : String(amount);
}

export function convertFromMicroDenom(denom: string) {
  return denom?.substring(1).toUpperCase();
}

export function convertToFixedDecimals(amount: number | string): string {
  if (typeof amount === 'string') {
    amount = Number(amount);
  }
  if (amount > 0.01) {
    return amount.toFixed(2);
  } else return String(amount);
}

export const zeroVotingCoin = {
  amount: '0',
  denom: 'orai',
};

export const zeroStakingCoin = {
  amount: '0',
  denom: process.env.NEXT_PUBLIC_STAKING_DENOM || 'orai',
};

export const customRegistry = new Registry([
  ...defaultStargateTypes,
  ...wasmTypes,
]);
customRegistry.register('/cosmos.gov.v1beta1.TextProposal', TextProposal);

export const encodeProto = (obj: any) => {
  if (typeof obj !== 'object') return obj;
  if (obj.type_url) {
    if (typeof obj.value === 'object') {
      const type = customRegistry.lookupType(obj.type_url);
      if (type) {
        // @ts-ignore
        const instance = type.fromPartial(encodeProto(obj.value));
        obj.value = Buffer.from(type.encode(instance).finish()).toString(
          'base64'
        );
      } else {
        console.log('not registered', obj.type_url);
      }
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      obj[key] = encodeProto(value);
    }
  }
  return obj;
};

export const decodeProto = (
  value: JsonObject,
  decodeBase64Recursive = true,
  path = ''
) => {
  if (!value) return '';
  const typeUrl = value.type_url || value.typeUrl;
  if (typeUrl) {
    // decode proto
    if (typeof value.value === 'object' && !Array.isArray(value.value)) {
      return value;
    }
    if (typeof value.value === 'string') {
      try {
        value.value = fromBinary(value.value);
      } catch {
        value.value = Buffer.from(value.value, 'base64');
      }
    }
    const decodedValue = customRegistry.decode({ typeUrl, value: value.value });
    return {
      type_url: typeUrl,
      value: decodeProto(decodedValue),
    };
  }
  for (const k in value) {
    if (
      typeof value[k] === 'string' &&
      (decodeBase64Recursive || (k === 'msg' && path.match(/wasm\.(?:\w+)$/)))
    ) {
      try {
        value[k] = fromBinary(value[k]);
      } catch {}
    }
    if (typeof value[k] === 'object') {
      value[k] = decodeProto(value[k], decodeBase64Recursive, path + '.' + k);
    }
  }
  if (value.msg instanceof Uint8Array)
    value.msg = JSON.parse(fromAscii(value.msg));
  return value;
};
