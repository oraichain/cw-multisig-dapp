import { toBinary } from '@cosmjs/cosmwasm-stargate';
import GenericForm from './GenericForm';

export default class ChangeMembers extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Update Members';
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
        new_members: {
          items: {
            'ui:widget': 'textarea',
            'ui:placeholder': 'Member'
          }
        },
        remove_members: {
          items: {
            'ui:widget': 'textarea',
            'ui:placeholder': 'Member'
          }
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
          new_members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                addr: {
                  type: 'string',
                  minLength: 43,
                  maxLength: 63
                },
                weight: {
                  type: 'number'
                }
              }
            },
            title: 'New Members',
            default: []
          },
          remove_members: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 43,
              maxLength: 63
            },
            title: 'Remove Members',
            default: []
          }
        }
      }
    };
    this.processData = ({ title, description, new_members, remove_members }) => {
      const msgs = [
        {
          wasm: {
            execute: {
              contract_addr: window.GroupAddress,
              msg: toBinary({
                update_members: { add: new_members, remove: remove_members }
              }),
              send: []
            }
          }
        }
      ];

      return { title, description, msgs };
    };
  }
}
