import { toBinary } from '@cosmjs/cosmwasm-stargate';
import GenericForm from './GenericForm';

export default class ChangeAdmin extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Change Group Address Admin';
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
        new_admin: {
          'ui:placeholder': 'eg: orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573'
        },
        'ui:submitButtonOptions': {
          submitText: 'Submit'
        }
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'new_admin'],
        properties: {
          title: {
            type: 'string',
            title: 'Title'
          },
          description: {
            type: 'string',
            title: 'Description'
          },
          new_admin: {
            type: 'string',
            title: 'New Admin',
            minLength: 43,
            maxLength: 63
          }
        }
      }
    };
    this.processData = ({ title, description, new_admin }) => {
      const msgs = [
        {
          wasm: {
            execute: {
              contract_addr: window.GroupAddress,
              msg: toBinary({ update_admin: { admin: new_admin } }),
              send: []
            }
          }
        }
      ];

      return { title, description, msgs };
    };
  }
}
