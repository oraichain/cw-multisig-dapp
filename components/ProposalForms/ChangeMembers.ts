import { toBinary } from '@cosmjs/cosmwasm-stargate'
import GenericForm from './GenericForm'

export default class ChangeMembers extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
      new_members: {
        items: {
          'ui:widget': 'textarea',
          'ui:placeholder': 'Member',
        },
      },
      remove_members: {
        items: {
          'ui:widget': 'textarea',
          'ui:placeholder': 'Member',
        },
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    }
    const schema = {
      properties: {
        new_members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              addr: {
                type: 'string',
                minLength: 43,
                maxLength: 63,
              },
              weight: {
                type: 'number',
              },
            },
          },
          title: 'New Members',
          default: [],
        },
        remove_members: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 43,
            maxLength: 63,
          },
          title: 'Remove Members',
          default: [],
        },
      },
    }

    super.init('Update Members', uiSchema, schema)
  }

  protected override processMessages({ new_members, remove_members }) {
    const msgs = [
      {
        wasm: {
          execute: {
            contract_addr: window.GroupAddress,
            msg: toBinary({
              update_members: { add: new_members, remove: remove_members },
            }),
            send: [],
          },
        },
      },
    ]

    return msgs
  }
}
