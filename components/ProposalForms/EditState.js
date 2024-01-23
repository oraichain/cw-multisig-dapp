import { toBinary } from '@cosmjs/cosmwasm-stargate';
import GenericForm from './GenericForm';

export default class EditState extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Edit Multisig State (Update new group address, etc...)';
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
        group_addr: {
          'ui:placeholder': 'New Group Address'
        },
        'ui:submitButtonOptions': {
          submitText: 'Submit'
        }
      },
      schema: {
        type: 'object',
        required: ['title', 'description', 'group_addr'],
        properties: {
          title: {
            type: 'string',
            title: 'Title'
          },
          description: {
            type: 'string',
            title: 'Description'
          },
          group_addr: {
            type: 'string',
            minLength: 43,
            maxLength: 63,
            title: 'New Group Address'
          }
        }
      }
    };
    this.processData = ({ title, description, group_addr }) => {
      const msgs = [
        {
          wasm: {
            execute: {
              contract_addr: window.MultisigAddress,
              msg: toBinary({ edit_state: { group_addr } }),
              send: []
            }
          }
        }
      ];

      return { title, description, msgs };
    };
  }
}
