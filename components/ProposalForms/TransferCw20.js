import { toBinary } from '@cosmjs/cosmwasm-stargate'
import { toAmount } from 'util/conversion'
import GenericForm from './GenericForm'

export default class TrasnferCw20 extends GenericForm {
  constructor(key) {
    super(key)
    this.title = 'Transfer CW20 tokens'
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
      },
      schema: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
          },
          description: {
            type: 'string',
            title: 'Description',
          },
          cw20_addr: {
            type: 'string',
            minLength: 43,
            maxLength: 63,
            title: 'CW20 token address to send from',
          },
          amount: {
            type: 'number',
            title: 'CW20 amount (exponent: 6)',
          },
          to: {
            type: 'string',
            minLength: 43,
            maxLength: 63,
          },
        },
      },
    }
    this.processData = ({ title, description, cw20_addr, amount, to }) => {
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
      ]

      return { title, description, msgs }
    }
  }
}
