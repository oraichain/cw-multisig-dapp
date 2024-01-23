import { encodeProto } from 'util/conversion'
import GenericForm from './GenericForm'

export default class CustomStargateExecute extends GenericForm {
  constructor(key) {
    super(key)
    this.title = 'Custom Stargate Execute'
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
        msg: {
          'ui:placeholder': JSON.stringify({
            type_url: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
            value: { amount: [{ denom: 'orai', amount: '1' }], depositor: '' },
          }),
          'ui:widget': 'jsoneditor',
        },
        'ui:submitButtonOptions': {
          submitText: 'Submit',
        },
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'msg'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
          },
          description: {
            type: 'string',
            title: 'Description',
          },
          msg: {
            type: 'string',
            title: 'Custom stargate execute message',
          },
        },
      },
    }
    this.processData = ({ title, description, msg }) => {
      try {
        const messages = [{ stargate: encodeProto(JSON.parse(msg)) }]
        return { title, description, msgs: messages }
      } catch (ex) {
        alert(ex.toString())
      }
    }
  }
}
