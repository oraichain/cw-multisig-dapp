import { toBinary } from '@cosmjs/cosmwasm-stargate'
import GenericForm from './GenericForm'

export default class ChangeAdmin extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
      new_admin: {
        'ui:placeholder': 'eg: orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    }

    const schema = {
      required: ['new_admin'],
      properties: {
        new_admin: {
          type: 'string',
          title: 'New Admin',
          minLength: 43,
          maxLength: 63,
        },
      },
    }
    super.init('Change Group Address Admin', uiSchema, schema)
  }

  protected override processMessages({ new_admin }) {
    const msgs = [
      {
        wasm: {
          execute: {
            contract_addr: window.GroupAddress,
            msg: toBinary({ update_admin: { admin: new_admin } }),
            send: [],
          },
        },
      },
    ]

    return msgs
  }
}
