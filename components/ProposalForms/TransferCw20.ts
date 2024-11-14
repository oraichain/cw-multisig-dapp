import { toBinary } from '@cosmjs/cosmwasm-stargate';
import { toAmount } from 'util/conversion';
import GenericForm from './GenericForm';

export default class TrasnferCw20 extends GenericForm {
  constructor(key: string) {
    super(key);

    const uiSchema = {
      cw20_addr: {
        'ui:placeholder': 'eg: orai14n3t...rha573',
      },
      amount: {
        'ui:placeholder': 'eg: 10',
      },
      to: {
        'ui:placeholder': 'eg: orai14n3t...rha573',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    };
    const schema = {
      properties: {
        cw20_addr: {
          type: 'string',
          minLength: 43,
          maxLength: 63,
          title: 'CW20 token address to send from',
        },
        amount: {
          type: 'string',
          title: 'CW20 amount (exponent: 6)',
        },
        to: {
          type: 'string',
          minLength: 43,
          maxLength: 63,
        },
      },
    };

    super.init('Transfer CW20 tokens', uiSchema, schema);
  }

  protected override processMessages({ cw20_addr, amount, to }) {
    this.validateNumber('amount', amount);
    const msgs = [
      {
        wasm: {
          execute: {
            contract_addr: cw20_addr,
            msg: toBinary({
              transfer: { recipient: to, amount: toAmount(amount) },
            }),
            funds: [],
          },
        },
      },
    ];

    return msgs;
  }
}
