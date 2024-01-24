// @ts-nocheck

import type { NextPage } from 'next'
import WalletLoader from 'components/WalletLoader'
import Select from 'react-select'
import Form from '@rjsf/core'
import { useSigningClient } from 'contexts/cosmwasm'
import validator from '@rjsf/validator-ajv8'
import { useState } from 'react'
import { useRouter } from 'next/router'
import LineAlert from 'components/LineAlert'
import widgets from 'components/widgets'
import FormFactory from 'components/ProposalForms/FormFactory'

const forms = FormFactory.Keys.map((value) => FormFactory.createForm(value))
const options = forms.map(({ key, title }) => ({ value: key, label: title }))

interface FormElements extends HTMLFormControlsCollection {
  label: HTMLInputElement
  description: HTMLInputElement
  json: HTMLInputElement
}

interface ProposalFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

function validateJsonSendMsg(json: any, multisigAddress: string) {
  if (typeof json !== 'object') {
    return false
  }
  if (!Array.isArray(json)) {
    return false
  }
  return true
}

const ProposalCreate: NextPage = () => {
  const router = useRouter()
  const multisigAddress = (router.query.multisigAddress || '') as string
  const { walletAddress, signingClient } = useSigningClient()
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [proposalID, setProposalID] = useState('')
  const [proposalForm, setProposalForm] = useState(options[0])

  const form = forms.find((item) => item.key === proposalForm.value)

  // const handleSubmit = (event: FormEvent<ProposalFormElement>) => {
  //   event.preventDefault()
  const createProposal = (msg: any) => {
    setLoading(true)
    setError('')

    signingClient
      ?.execute(walletAddress, multisigAddress, { propose: msg }, 'auto')
      .then((response) => {
        setLoading(false)
        setTransactionHash(response.transactionHash)
        const [{ events }] = response.logs
        const [wasm] = events.filter((e) => e.type === 'wasm')
        const [{ value }] = wasm.attributes.filter(
          (w) => w.key === 'proposal_id'
        )
        setProposalID(value)
      })
      .catch((e) => {
        setLoading(false)
        setError(e.message)
      })
  }

  const complete = transactionHash.length > 0

  return (
    <WalletLoader>
      <div className="flex flex-col w-full">
        <div className="grid bg-base-100 place-items-center">
          <div className="text-left container mx-auto max-w-lg">
            <Select
              options={options}
              value={proposalForm}
              classNamePrefix="react-select"
              className="my-8 shadow-sm text-lg rounded-full form-select"
              onChange={setProposalForm}
            />

            <Form
              readonly={complete}
              widgets={widgets}
              schema={form.schema.schema}
              validator={validator}
              uiSchema={form.schema.uiSchema}
              onSubmit={({ formData }) => {
                const proposal = form.processData(formData)
                if (proposal) {
                  createProposal(proposal)
                }
              }}
            />
          </div>

          {error && (
            <div className="mt-8">
              <LineAlert variant="error" msg={error} />
            </div>
          )}

          {proposalID.length > 0 && (
            <div className="mt-8 text-right">
              <LineAlert
                variant="success"
                link={`https://oraiscan.io/Oraichain/tx/${transactionHash}`}
                msg={`Success! Transaction Hash: ${transactionHash}`}
              />
              <button
                className="mt-4 box-border px-4 py-2 btn btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/${multisigAddress}/${proposalID}`)
                }}
              >
                View Proposal &#8599;
              </button>
            </div>
          )}
        </div>
      </div>
    </WalletLoader>
  )
}

export default ProposalCreate
