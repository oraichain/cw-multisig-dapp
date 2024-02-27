import { toBinary } from '@cosmjs/cosmwasm-stargate'
import GenericForm from './GenericForm'

export default class CustomContractExecute extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
      messages: {
        'ui:placeholder':
          '[{"wasm":{"execute":{"contract_addr":"orai...","send":[{"amount":"1","denom":"orai"}],"msg":{"transfer":{"recipient":"orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573","amount":"1"}}}}}]',
        'ui:widget': 'jsoneditor',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    }
    const schema = {
      properties: {
        messages: {
          type: 'string',
          title: 'Custom contract execute message',
        },
      },
    }

    super.init('Custom Smart Contract Execute', uiSchema, schema)
  }

  override processMessages({ messages }) {
    let messagesObjects = JSON.parse(messages)
    if (!Array.isArray(messagesObjects)) {
      messagesObjects = [messagesObjects]
    }
    const msgs = messagesObjects.map((message) => {
      // default message
      if (!message.wasm) return message
      // fix wasm message
      const method = Object.keys(message.wasm)[0]
      return {
        wasm: {
          [method]: {
            ...message.wasm[method],
            msg: toBinary(message.wasm[method].msg),
          },
        },
      }
    })
    return msgs
  }
}
