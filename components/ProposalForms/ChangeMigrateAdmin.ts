import GenericForm from './GenericForm'

export default class ChangeMigrationAdmin extends GenericForm {
  constructor(key: string) {
    super(key)
    const uiSchema = {
      contract_addr: {
        'ui:placeholder': 'eg: orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573',
      },
      new_admin: {
        'ui:placeholder': 'eg: orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    }

    const schema = {
      required: ['contract_addr', 'new_admin'],
      properties: {
        new_admin: {
          type: 'string',
          title: 'New Admin',
          minLength: 43,
          maxLength: 63,
        },
        contract_addr: {
          type: 'string',
          title: 'Target Contract Address',
          minLength: 43,
          maxLength: 63,
        },
      },
    }
    super.init('Change Contract Migration Admin', uiSchema, schema)
  }

  protected override processMessages({ new_admin, contract_addr }) {
    const msgs = [
      {
        wasm: {
          update_admin: {
            contract_addr,
            admin: new_admin,
          },
        },
      },
    ]

    return msgs
  }
}
