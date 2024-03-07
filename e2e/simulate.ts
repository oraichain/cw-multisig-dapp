import {
  Cw3FlexMultisigClient,
  Cw4GroupClient,
} from '@oraichain/common-contracts-sdk';
import { SimulateCosmWasmClient, DownloadState } from '@oraichain/cw-simulate';
import fs from 'fs';
import path from 'path';

const multisigAddr = 'orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0';
const groupAddr = 'orai18s0fxs2f3jhxxe7pkezh8dzd5pm44qt4ht5pv5';

const downloadState = new DownloadState(
  'https://lcd.orai.io',
  path.resolve(__dirname, 'data')
);
const senderAddress = 'orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0';

// ;(async () => {
//   await downloadState.saveState(multisigAddr)
//   await downloadState.saveState(groupAddr)
// })()

const start = async () => {
  const client = new SimulateCosmWasmClient({
    chainId: 'Oraichain',
    bech32Prefix: 'orai',
  });

  await downloadState.loadState(client, senderAddress, groupAddr, 'group');
  await downloadState.loadState(
    client,
    senderAddress,
    multisigAddr,
    'multisig'
  );

  const multisigClient = new Cw3FlexMultisigClient(
    client,
    multisigAddr,
    multisigAddr
  );
  const proposals = await multisigClient.listProposals({
    limit: 100,
    startAfter: 360,
  });

  console.log('proposals: ', proposals);
  const config = await multisigClient.config();
  console.log('config: ', config);

  const group = new Cw4GroupClient(client, multisigAddr, groupAddr);
  const { members } = await group.listMembers({});

  // setup 3 voters
  const voters = members.map(
    ({ addr }) => new Cw3FlexMultisigClient(client, addr, multisigAddr)
  );

  const res = await voters[0].propose({
    title: 'bar',
    description: 'foo',
    msgs: [
      {
        bank: {
          send: {
            to_address: 'orai1zm4zwxxtwe44aymcpp9qj94dew63guv58ncrj6',
            amount: [{ denom: 'orai', amount: '1' }],
          },
        },
      },
    ],
  });

  const proposalId = Number(
    res.events.flatMap((e) => e.attributes).find((a) => a.key === 'proposal_id')
      .value
  );

  await voters[1].vote({ proposalId: proposalId, vote: 'yes' });
  await voters[2].vote({ proposalId: proposalId, vote: 'yes' });

  const result = await voters[0].execute({ proposalId: proposalId });
  console.log({ result });
};

start();
