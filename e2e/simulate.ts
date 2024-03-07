import { Cw3FlexMultisigClient } from '@oraichain/common-contracts-sdk'
import { SimulateCosmWasmClient, DownloadState } from '@oraichain/cw-simulate'
import fs from 'fs'
import path from 'path'

const multisigAddr = 'orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0'
const groupAddr = 'orai18s0fxs2f3jhxxe7pkezh8dzd5pm44qt4ht5pv5'

const downloadState = new DownloadState(
  'https://lcd.orai.io',
  path.resolve(__dirname, 'data')
)
const senderAddress = 'orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0'

// ;(async () => {
//   await downloadState.saveState(multisigAddr)
//   await downloadState.saveState(groupAddr)
// })()

const start = async () => {
  const client = new SimulateCosmWasmClient({
    chainId: 'Oraichain',
    bech32Prefix: 'orai',
  })

  await downloadState.loadState(client, senderAddress, groupAddr, 'group')
  await downloadState.loadState(client, senderAddress, multisigAddr, 'multisig')

  const multisigClient = new Cw3FlexMultisigClient(
    client,
    multisigAddr,
    multisigAddr
  )
  const proposals = await multisigClient.listProposals({
    limit: 100,
    startAfter: 360,
  })
  console.log('proposals: ', proposals)
  const config = await multisigClient.config()
  console.log('config: ', config)

  // setup 3 voters
  const voter1 = new Cw3FlexMultisigClient(
    client,
    'orai1zm4zwxxtwe44aymcpp9qj94dew63guv58ncrj6',
    multisigAddr
  )
  const voter2 = new Cw3FlexMultisigClient(
    client,
    'orai1sukkexujpz2trec6x8t6c3dlngc52c2t5m2q29',
    multisigAddr
  )
  const voter3 = new Cw3FlexMultisigClient(
    client,
    'orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7',
    multisigAddr
  )
  await voter1.propose({
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
  })
  await voter1.vote({ proposalId: 395, vote: 'yes' })
  await voter2.vote({ proposalId: 395, vote: 'yes' })
  await voter3.vote({ proposalId: 395, vote: 'yes' })

  const result = await voter1.execute({ proposalId: 395 })
  console.log({ result })
}

start()
