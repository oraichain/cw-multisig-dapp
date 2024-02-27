import { encodeProto } from 'util/conversion'
import GenericForm from './GenericForm'

export default class CustomStargateExecute extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
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
    }

    const schema = {
      required: ['msg'],
      properties: {
        msg: {
          type: 'string',
          title: 'Custom stargate execute message',
        },
      },
    }
    super.init('Custom Stargate Execute', uiSchema, schema)
  }

  protected override processMessages({ msg }) {
    const msgs = [{ stargate: encodeProto(JSON.parse(msg)) }]
    return msgs
  }
}
