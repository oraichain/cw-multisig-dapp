import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class CreatTransfer extends GenericForm {
  constructor(key) {
    super(key)
    this.title = 'Create Transfer'
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
        amount: {
          'ui:placeholder': 'eg: 1.5',
        },
        to: {
          'ui:placeholder': 'orai123xxx...',
        },
        'ui:submitButtonOptions': {
          submitText: 'Transfer',
        },
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'amount', 'to'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
          },
          description: {
            type: 'string',
            title: 'Description',
          },
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
      },
    }
    this.processData = ({ title, description, amount, to }) => {
      const msgs = [
        {
          bank: {
            send: {
              to_address: to,
              from_address: window.MultisigAddress,
              amount: [
                {
                  denom: process.env.NEXT_PUBLIC_STAKING_DENOM,
                  amount: toAmount(amount),
                },
              ],
            },
          },
        },
      ]

      return { title, description, msgs }
    }
  }
}
