import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class Delegate extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
      list_delegations: {
        items: {
          'ui:widget': 'textarea',
          'ui:placeholder': 'Delegations',
        },
      },
      'ui:submitButtonOptions': {
        submitText: 'Delegate',
      },
    }

    const schema = {
      required: ['list_delegations'],
      properties: {
        list_delegations: {
          type: 'array',
          items: {
            type: 'object',
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
          },
          title: 'List Delegations',
          default: [],
        },
      },
    }

    super.init('Delegate native ORAIs to a set of validators', uiSchema, schema)
  }

  protected override processMessages({ list_delegations }) {
    const msgs = list_delegations.map((delegation: any) => ({
      staking: {
        delegate: {
          validator: delegation.validator,
          amount: {
            denom: process.env.NEXT_PUBLIC_STAKING_DENOM,
            amount: toAmount(delegation.amount),
          },
        },
      },
    }))

    return msgs
  }
}
