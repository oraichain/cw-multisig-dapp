import { toAmount } from 'util/conversion';
import GenericForm from './GenericForm';

export default class CreatTransfer extends GenericForm {
  constructor(key: string) {
    super(key);
    const uiSchema = {
      amount: {
        'ui:placeholder': 'eg: 1.5',
      },
      to: {
        'ui:placeholder': 'orai123xxx...',
      },
      'ui:submitButtonOptions': {
        submitText: 'Transfer',
      },
    };
    const schema = {
      required: ['amount', 'to'],
      properties: {
        amount: {
          type: 'number',
          title: 'ORAI',
        },
        to: {
          type: 'string',
          minLength: 43,
          maxLength: 63,
        },
      },
    };
    super.init('Create Transfer', uiSchema, schema);
  }

  protected override processMessages({ amount, to, multisigAddress }) {
    const msgs = [
      {
        bank: {
          send: {
            to_address: to,
            from_address: multisigAddress,
            amount: [
              {
                denom: process.env.NEXT_PUBLIC_STAKING_DENOM,
                amount: toAmount(amount),
              },
            ],
          },
        },
      },
    ];

    return msgs;
  }
}
