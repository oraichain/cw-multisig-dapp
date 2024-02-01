// @ts-nocheck

import type { NextPage } from 'next'
import WalletLoader from 'components/WalletLoader'
import Select from 'react-select'
import Form from '@rjsf/core'
import { useSigningClient } from 'contexts/cosmwasm'
import validator from '@rjsf/validator-ajv8'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LineAlert from 'components/LineAlert'
import widgets from 'components/widgets'
import FormFactory from 'components/ProposalForms/FormFactory'
import { parseJSONRecursive } from 'util/json'

const forms = FormFactory.Keys.map((value) => FormFactory.createForm(value))
const options = forms.map(({ key, title }) => ({ value: key, label: title }))

interface FormElements extends HTMLFormControlsCollection {
  label: HTMLInputElement
  description: HTMLInputElement
  json: HTMLInputElement
}

const ProposalCreate: NextPage = () => {
  const router = useRouter()
  const multisigAddress = (router.query.multisigAddress || '') as string
  const id = (router.query.id || '') as string
  const { walletAddress, signingClient } = useSigningClient()
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [proposalID, setProposalID] = useState('')
  const [proposalForm, setProposalForm] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (!signingClient) return

    if (id) {
      signingClient
        .queryContractSmart(multisigAddress, {
          proposal: { proposal_id: parseInt(id) },
        })
        .then((proposal) => {
          const { title, description, msgs } = proposal
          const formKey = msgs.some((msg: any) => 'wasm' in msg)
            ? 'custom-contract-execute'
            : 'custom-stargate-execute'
          const option = options.find((o) => o.value === formKey)
          setProposalForm(option)
          setFormData({
            title,
            description,
            messages: JSON.stringify(parseJSONRecursive(msgs), null, 2),
          })
        })
    } else {
      setProposalForm(options[0])
    }
  }, [id, signingClient])

  const form =
    proposalForm && forms.find((item) => item.key === proposalForm.value)

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
            {proposalForm && (
              <Select
                options={options}
                value={proposalForm}
                classNamePrefix="react-select"
                className="my-8 shadow-sm text-lg rounded-full form-select"
                onChange={setProposalForm}
              />
            )}

            {form && (
              <Form
                disabled={loading}
                formData={formData}
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
            )}
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
