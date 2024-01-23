import GenericForm from './GenericForm';

export default class ChangeMigrationAdmin extends GenericForm {
  constructor(key) {
    super(key);
    this.title = 'Change Contract Migration Admin';
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
          'ui:placeholder': 'eg: orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573'
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
        required: ['title', 'description', 'contract_addr', 'new_admin'],
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
          },
          contract_addr: {
            type: 'string',
            title: 'Target Contract Address',
            minLength: 43,
            maxLength: 63
          }
        }
      }
    };
    this.processData = ({ title, description, new_admin, contract_addr }) => {
      const msgs = [
        {
          wasm: {
            update_admin: {
              contract_addr,
              admin: new_admin
            }
          }
        }
      ];

      return { title, description, msgs };
    };
  }
}
