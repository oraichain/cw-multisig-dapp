import {
  MsgExecuteContractEncodeObject,
  MsgUpdateAdminEncodeObject,
} from '@cosmjs/cosmwasm-stargate';
import { toUtf8 } from '@cosmjs/encoding';
import { EncodeObject } from '@cosmjs/proto-signing';
import { isDeliverTxFailure } from '@cosmjs/stargate';
import LineAlert from 'components/LineAlert';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import {
  MsgExecuteContract,
  MsgUpdateAdmin,
} from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { MULTISIG_CODE_ID } from 'hooks/cosmwasm';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { InstantiateMsg } from 'types/cw3';

function AddressRow({
  idx,
  readOnly,
  onRemove,
}: {
  idx: number;
  readOnly: boolean;
  onRemove?: (id: number) => void;
}) {
  return (
    <tr>
      <td className="pr-2 pb-2">
        <input
          className="block box-border m-0 w-full rounded input input-bordered focus:input-primary font-mono"
          type="text"
          name={`address_${idx}`}
          placeholder="wallet address..."
          size={45}
          readOnly={readOnly}
        />
      </td>
      <td className="pb-2">
        <div className="flex items-center block input-bordered input box-border focus:input-primary m-0 w-full rounded pr-0 font-mono">
          <input
            type="number"
            className="bg-transparent outline-none"
            name={`weight_${idx}`}
            defaultValue="1"
            min={1}
            max={999}
            readOnly={readOnly}
          />
          {idx > 1 && (
            <button
              type="button"
              onClick={() => onRemove?.(idx)}
              className="p-2 text-lg"
            >
              &#10008;
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function validateNonEmpty(msg: InstantiateMsg, label: string) {
  const { threshold, max_voting_period } = msg;
  if (isNaN(threshold.absolute_count.weight) || isNaN(max_voting_period.time)) {
    return false;
  }
  if (label.length === 0) {
    return false;
  }

  return true;
}

interface FormElements extends HTMLFormControlsCollection {
  duration: HTMLInputElement;
  threshold: HTMLInputElement;
  label: HTMLInputElement;
  [key: string]: any;
}

interface MultisigFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const CreateMultisig: NextPage = () => {
  const router = useRouter();
  const { walletAddress, signingClient } = useSigningClient();
  const [addressIds, setAddressIds] = useState([0, 1]);
  const [contractAddress, setContractAddress] = useState('');
  const [groupAddress, setGroupAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<
    'group' | 'multisig' | 'change-admin' | ''
  >('');

  const handleSubmitGroup = async (event: FormEvent<MultisigFormElement>) => {
    event.preventDefault();
    if (!signingClient) {
      setLoading('');
      setError('Please try reconnecting your wallet.');
      return;
    }

    const formEl = event.currentTarget as MultisigFormElement;

    const voters = addressIds.map((idx) => ({
      addr: formEl[`address_${idx}`]?.value?.trim(),
      weight: parseInt(formEl[`weight_${idx}`]?.value?.trim()),
    }));

    // instantiate group address
    const groupAddrMsg = {
      admin: walletAddress,
      members: voters,
    };

    setLoading('group');
    try {
      const result = await signingClient.instantiate(
        walletAddress,
        Number(process.env.NEXT_PUBLIC_CW4_GROUP_CODE_ID),
        groupAddrMsg,
        formEl.groupLabel.value.trim() || 'cw4 group address',
        'auto',
        { admin: walletAddress }
      );

      setGroupAddress(result.contractAddress);
      setError('');
    } catch (err) {
      console.log('err', err);
      setError(err.message);
    }
    setLoading('');
  };

  const handleSubmit = async (event: FormEvent<MultisigFormElement>) => {
    event.preventDefault();
    if (!signingClient) {
      setLoading('');
      setError('Please try reconnecting your wallet.');
      return;
    }

    const formEl = event.currentTarget as MultisigFormElement;

    const executor =
      formEl.executor.value === 'none'
        ? undefined
        : formEl.executor.value === 'member'
        ? 'member'
        : { only: formEl.only.value.trim() };

    const required_weight = parseInt(formEl.threshold.value?.trim());
    const max_voting_period = {
      time: parseInt(formEl.duration.value?.trim()),
    };

    const msg = {
      group_addr: formEl.groupAddress.value.trim(),
      threshold: { absolute_count: { weight: required_weight } },
      max_voting_period,
      executor, // {"only":""} | undefined | "member"
    };

    const label = formEl.label.value.trim();

    // @ebaker TODO: add more validation
    if (!validateNonEmpty(msg, label)) {
      setLoading('');
      setError('All fields are required.');
      return;
    }

    setLoading('multisig');
    try {
      const response = await signingClient.instantiate(
        walletAddress,
        MULTISIG_CODE_ID,
        msg,
        label,
        'auto',
        {
          admin: walletAddress,
        }
      );

      if (response.contractAddress.length > 0) {
        setContractAddress(response.contractAddress);
      }
      setError('');
    } catch (err: any) {
      console.log('err', err);
      setError(err.message);
    }

    setLoading('');
  };

  const changeAdminToMultisig = async () => {
    if (!signingClient) {
      setLoading('');
      setError('Please try reconnecting your wallet.');
      return;
    }

    setLoading('change-admin');
    try {
      // change admin of multisig to multisig
      const messages: EncodeObject[] = [
        {
          typeUrl: '/cosmwasm.wasm.v1.MsgUpdateAdmin',
          value: MsgUpdateAdmin.fromPartial({
            sender: walletAddress,
            contract: contractAddress,
            newAdmin: contractAddress,
          }),
        } as MsgUpdateAdminEncodeObject,
      ];

      if (groupAddress) {
        // change admin of group address to multisig
        messages.push({
          typeUrl: '/cosmwasm.wasm.v1.MsgUpdateAdmin',
          value: MsgUpdateAdmin.fromPartial({
            sender: walletAddress,
            contract: groupAddress,
            newAdmin: contractAddress,
          }),
        } as MsgUpdateAdminEncodeObject);

        // change admin logic of group address to multisig
        messages.push({
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: walletAddress,
            contract: groupAddress,
            msg: toUtf8(
              JSON.stringify({
                update_admin: { admin: contractAddress },
              })
            ),
          }),
        } as MsgExecuteContractEncodeObject);
      }

      const result = await signingClient.signAndBroadcast(
        walletAddress,
        messages,
        'auto'
      );
      if (isDeliverTxFailure(result)) {
        throw new Error(result.rawLog);
      }

      setError('');
    } catch (err: any) {
      console.log('err', err);
      setError(err.message);
    }

    setLoading('');
  };

  const complete = contractAddress.length > 0;

  return (
    <WalletLoader>
      <div className="text-center container mx-auto max-w-lg">
        <h1 className="text-5xl font-bold mb-8">New Multisig</h1>
        <form
          className="container mx-auto max-w-lg mb-8"
          onSubmit={handleSubmitGroup}
        >
          <div className="w-full my-4">
            <label className="text-left font-bold block w-full pb-2">
              Group Label
            </label>
            <input
              className="block box-border m-0 w-full rounded input input-bordered focus:input-primary font-mono"
              type="text"
              name="groupLabel"
              placeholder="my group"
              size={45}
              readOnly={complete}
            />
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr>
                <th className="text-left">Address</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {addressIds.map((idx) => (
                <AddressRow
                  key={idx}
                  idx={idx}
                  readOnly={complete}
                  onRemove={(id) => {
                    const index = addressIds.indexOf(id);
                    setAddressIds(
                      addressIds
                        .slice(0, index)
                        .concat(addressIds.slice(index + 1))
                    );
                  }}
                />
              ))}
              <tr>
                <td colSpan={2} className="text-right">
                  <button
                    className="btn btn-outline btn-primary btn-md text-md rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setAddressIds(
                        addressIds.concat(Math.max(...addressIds) + 1)
                      );
                    }}
                  >
                    + Add another
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {!complete && (
            <button
              className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full w-full ${
                loading === 'group' ? 'loading' : ''
              }`}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              type="submit"
              disabled={loading === 'group'}
            >
              Create Group
            </button>
          )}
        </form>

        <form
          className="container mx-auto max-w-lg mb-8"
          onSubmit={handleSubmit}
        >
          <div className="w-full my-4">
            <label className="text-left font-bold block w-full pb-2">
              Multisign Label
            </label>
            <input
              className="block box-border m-0 w-full rounded  input input-bordered focus:input-primary"
              name="label"
              type="text"
              placeholder="My multisig name"
              readOnly={complete}
            />
          </div>

          <div className="w-full my-4">
            <label className="text-left font-bold block w-full pb-2">
              Group Address
            </label>
            <input
              className="block box-border m-0 w-full rounded input input-bordered focus:input-primary font-mono"
              type="text"
              name="groupAddress"
              placeholder="orai1xxxx..."
              defaultValue={groupAddress}
              size={45}
              readOnly={complete}
            />
          </div>

          <table className="w-full my-4">
            <thead>
              <tr>
                <th className="text-left">Executor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pb-2">
                  <select
                    defaultValue="member"
                    onChange={(e) => {
                      // @ts-ignore
                      document.querySelector('#only').style.display =
                        e.target.value === 'only' ? 'block' : 'none';
                    }}
                    name="executor"
                    className="block box-border m-0 w-full rounded  input input-bordered focus:input-primary"
                  >
                    <option value="member">Member</option>
                    <option value="only">Only</option>
                    <option value="none">None</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="pb-2">
                  <input
                    id="only"
                    className="block box-border m-0 w-full rounded input input-bordered focus:input-primary"
                    name="only"
                    style={{ display: 'none' }}
                    type="text"
                    placeholder="Only address"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full my-4">
            <thead>
              <tr>
                <th className="text-left">Threshold</th>
                <th className="text-left box-border px-2 text-sm">
                  Max Voting Period (seconds)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    className="block box-border m-0 w-full rounded input input-bordered focus:input-primary"
                    name="threshold"
                    type="number"
                    defaultValue={addressIds.length}
                    min={1}
                    max={999}
                    readOnly={complete}
                  />
                </td>
                <td className="box-border px-2">
                  <input
                    className="block box-border m-0 w-full rounded input input-bordered focus:input-primary"
                    name="duration"
                    type="number"
                    placeholder="duration in seconds"
                    min={1}
                    max={2147483647}
                    defaultValue={604800}
                    readOnly={complete}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {!complete && (
            <button
              className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full w-full ${
                loading === 'multisig' ? 'loading' : ''
              }`}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              type="submit"
              disabled={loading === 'multisig'}
            >
              Create Multisig
            </button>
          )}
        </form>

        {error && <LineAlert variant="error" msg={error} />}

        {contractAddress !== '' && (
          <div className="text-right">
            <LineAlert variant="success" msg={`Success!`} />

            <div className="w-full flex items-center justify-between">
              <button
                className={`mt-4 box-border px-4 py-2 btn btn-info ${
                  loading === 'change-admin' ? 'loading' : ''
                }`}
                disabled={loading === 'change-admin'}
                onClick={(e) => {
                  e.preventDefault();
                  changeAdminToMultisig();
                }}
              >
                Change admin to multisig
              </button>

              <button
                className="mt-4 box-border px-4 py-2 btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${encodeURIComponent(contractAddress)}`);
                }}
              >
                View Multisig &#8599;
              </button>
            </div>
          </div>
        )}
      </div>
    </WalletLoader>
  );
};

export default CreateMultisig;
