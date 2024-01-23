import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class Delegate extends GenericForm {
  constructor(key) {
    super(key)
    this.title = 'Delegate native ORAIs to a set of validators'
    this.schema = {
      uiSchema: {
        title: {
          'ui:autofocus': true,
          'ui:placeholder': 'Proposal title',
        },
        description: {
          'ui:placeholder': 'Proposal description',
          'ui:widget': 'textarea',
        },
        list_delegations: {
          items: {
            'ui:widget': 'textarea',
            'ui:placeholder': 'Delegations',
          },
        },
        'ui:submitButtonOptions': {
          submitText: 'Delegate',
        },
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'list_delegations'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
          },
          description: {
            type: 'string',
            title: 'Description',
          },
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
      },
    }
    this.processData = ({ title, description, list_delegations }) => {
      const msgs = list_delegations.map((delegation) => ({
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

      return { title, description, msgs }
    }
  }
}
