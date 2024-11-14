import GenericForm from './GenericForm';

export default class MigrateContract extends GenericForm {
  constructor(key: string) {
    super(key);

    const uiSchema = {
      contract_addr: {
        'ui:placeholder': 'eg: orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
      },
      new_code_id: {
        type: 'number',
        'ui:placeholder': 'eg: 100',
      },
      message: {
        'ui:placeholder':
          '{"transfer":{"recipient":"orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573","amount":"1"}}',
        'ui:widget': 'jsoneditor',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    };
    const schema = {
      required: ['contract_addr', 'new_code_id'],
      properties: {
        contract_addr: {
          type: 'string',
          minLength: 43,
          maxLength: 63,
          title: 'Contract address to be migrated',
        },
        new_code_id: {
          type: 'string',
          title: 'The new Code Id that the contract is to be migrated to',
        },
        message: {
          type: ['string'],
          title: 'Optional migrate message for the contract if needed',
        },
      },
    };

    super.init('Migrate A Smart Contract', uiSchema, schema);
  }

  protected override processMessages({
    contract_addr,
    new_code_id,
    message = '{}', // default message
  }) {
    this.validateNumber('new_code_id', new_code_id);
    const msgs = [
      {
        wasm: {
          migrate: {
            contract_addr,
            new_code_id: Number(new_code_id),
            msg: Buffer.from(message).toString('base64'),
          },
        },
      },
    ];

    return msgs;
  }
}
