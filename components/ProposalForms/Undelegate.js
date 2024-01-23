import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class Undelegate extends GenericForm {
  constructor(key) {
    super(key)
    this.title = 'Undelegate native ORAI from a validator'
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
        validator: {
          'ui:placeholder': 'oraivaloper123xxx...',
        },
        'ui:submitButtonOptions': {
          submitText: 'Undelegate',
        },
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'amount', 'validator'],
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
          validator: {
            type: 'string',
            minLength: 50,
            maxLength: 50,
          },
        },
      },
    }
    this.processData = ({ title, description, amount, validator }) => {
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

      return { title, description, msgs }
    }
  }
}
