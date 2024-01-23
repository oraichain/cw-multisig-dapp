import { toBinary } from '@cosmjs/cosmwasm-stargate';
import GenericForm from './GenericForm';

export default class CustomContractExecute extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Custom Smart Contract Execute';
    this.schema = {
      uiSchema: {
        title: {
          'ui:autofocus': true,
          'ui:placeholder': 'Proposal title'
        },
        description: {
          'ui:placeholder': 'Proposal description',
          'ui:widget': 'textarea'
        },
        cw20_addr: {
          'ui:placeholder': 'eg: orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'
        },
        messages: {
          'ui:placeholder': '[{"wasm":{"execute":{"contract_addr":"orai...","send":[{"amount":"1","denom":"orai"}],"msg":{"transfer":{"recipient":"orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573","amount":"1"}}}}}]',
          'ui:widget': 'jsoneditor'
        },
        'ui:submitButtonOptions': {
          submitText: 'Submit'
        }
      },
      schema: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: {
            type: 'string',
            title: 'Title'
          },
          description: {
            type: 'string',
            title: 'Description'
          },
          messages: {
            type: 'string',
            title: 'Custom contract execute message'
          }
        }
      }
    };
    this.processData = ({ title, description, messages }) => {
      try {
        const messagesObject = JSON.parse(messages);
        const msgs = messagesObject.map((message) => ({ wasm: { execute: { ...message.wasm.execute, msg: toBinary(message.wasm.execute.msg) } } }));
        return { title, description, msgs };
      } catch (ex) {
        alert(ex.toString());
      }
    };
  }
}
