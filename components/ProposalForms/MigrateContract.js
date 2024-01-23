import GenericForm from './GenericForm';

export default class MigrateContract extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Migrate A Smart Contract';
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
        contract_addr: {
          'ui:placeholder': 'eg: orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'
        },
        new_code_id: {
          "type": "number",
          'ui:placeholder': 'eg: 100'
        },
        message: {
          'ui:placeholder':
            '{"transfer":{"recipient":"orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573","amount":"1"}}',
          'ui:widget': 'jsoneditor'
        },
        'ui:submitButtonOptions': {
          submitText: 'Submit'
        }
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'contract_addr', 'new_code_id', 'message'],
        properties: {
          title: {
            type: 'string',
            title: 'Title'
          },
          description: {
            type: 'string',
            title: 'Description'
          },
          contract_addr: {
            type: 'string',
            minLength: 43,
            maxLength: 63,
            title: 'Contract address to be migrated'
          },
          new_code_id: {
            type: 'number',
            title: 'The new Code Id that the contract is to be migrated to'
          },
          message: {
            type: ['string'],
            title: 'Optional migrate message for the contract if needed'
          }
        }
      }
    };
    this.processData = ({ title, description, contract_addr, new_code_id, message }) => {
      const msgs = [
        {
          wasm: {
            migrate: {
              contract_addr,
              new_code_id,
              msg: Buffer.from(message).toString('base64'),
            }
          }
        }
      ];

      return { title, description, msgs };
    };
  }
}
