import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class Undelegate extends GenericForm {
  constructor(key: string) {
    super(key)

    const uiSchema = {
      amount: {
        'ui:placeholder': 'eg: 1.5',
      },
      validator: {
        'ui:placeholder': 'oraivaloper123xxx...',
      },
      'ui:submitButtonOptions': {
        submitText: 'Undelegate',
      },
    }

    const schema = {
      required: ['amount', 'validator'],
      properties: {
        amount: {
          type: 'number',
          title: 'ORAI',
        },
        validator: {
          type: 'string',
          minLength: 50,
          maxLength: 50,
        },
      },
    }

    super.init('Undelegate native ORAI from a validator', uiSchema, schema)
  }

  protected override processMessages({ amount, validator }) {
    const msgs = [
      {
        staking: {
          undelegate: {
            validator: validator,
            amount: {
              denom: process.env.NEXT_PUBLIC_STAKING_DENOM,
              amount: toAmount(amount),
            },
          },
        },
      },
    ]

    return msgs
  }
}
