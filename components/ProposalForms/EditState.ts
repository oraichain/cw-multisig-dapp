import { toBinary } from '@cosmjs/cosmwasm-stargate';
import GenericForm from './GenericForm';

export default class EditState extends GenericForm {
  constructor(key: string) {
    super(key);
    const uiSchema = {
      group_addr: {
        'ui:placeholder': 'New Group Address',
      },
      'ui:submitButtonOptions': {
        submitText: 'Submit',
      },
    };

    const schema = {
      required: ['group_addr'],
      properties: {
        group_addr: {
          type: 'string',
          minLength: 43,
          maxLength: 63,
          title: 'New Group Address',
        },
      },
    };

    super.init(
      'Edit Multisig State (Update new group address, etc...)',
      uiSchema,
      schema
    );
  }

  protected override processMessages({ group_addr, multisigAddress }) {
    const msgs = [
      {
        wasm: {
          execute: {
            contract_addr: multisigAddress,
            msg: toBinary({ edit_state: { group_addr } }),
            send: [],
          },
        },
      },
    ];

    return msgs;
  }
}
