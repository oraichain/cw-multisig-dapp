import type { NextPage } from 'next';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LineAlert from 'components/LineAlert';
import { ProposalResponse } from 'types/cw3';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import widgets from 'components/widgets';
import { json } from '@codemirror/lang-json';
import { decodeProto } from 'util/conversion';
import { ExecuteInstruction } from '@cosmjs/cosmwasm-stargate';
import { users } from 'util/constants';

function VoteButtons({
  onVoteYes = () => {},
  onVoteNo = () => {},
  onBack = (e: any) => {},
  votes = [],
  walletAddress = '',
  status = '',
}) {
  let voted = false;

  const voteList = votes.map((vote) => {
    const variant =
      vote.vote === 'yes' ? 'success' : vote.vote === 'no' ? 'error' : 'error';
    let voter = vote.voter;
    if (voter === walletAddress) {
      voted = true;
      voter = 'You (' + walletAddress + ')';
    } else if (users[voter]) {
      voter = users[voter] + ' (' + voter + ')';
    }
    return (
      <LineAlert
        key={vote.voter}
        className="mt-2"
        variant={variant}
        link={`https://oraiscan.io/Oraichain/account/${vote.voter}`}
        msg={`${voter} voted ${vote.vote}`}
      />
    );
  });

  if (voted) {
    return (
      <>
        {voteList}

        {status === 'open' && (
          <button
            className="box-border px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white my-4"
            onClick={onBack}
          >
            {'< Proposals'}
          </button>
        )}
      </>
    );
  }

  if (status !== 'open') {
    return null;
  }
  return (
    <>
      {voteList}
      <div className="flex justify-between content-center mt-2">
        <button
          className="box-border px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
          onClick={onBack}
        >
          {'< Proposals'}
        </button>

        <button
          className="box-border px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
          onClick={onVoteYes}
        >
          Sign
        </button>
        <button
          className="box-border px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
          onClick={onVoteNo}
        >
          Reject
        </button>
      </div>
    </>
  );
}

const Proposal: NextPage = () => {
  const router = useRouter();
  const multisigAddress = router.query.multisigAddress as string;
  const proposalId = parseInt(router.query.proposalId as string);

  const { walletAddress, signingClient } = useSigningClient();
  const [customMsg, setCustomMsg] = useState('[]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [votes, setVotes] = useState([]);
  const [timestamp, setTimestamp] = useState(new Date());
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    if (!signingClient || !multisigAddress) {
      return;
    }

    setLoading(true);
    Promise.all([
      signingClient.queryContractSmart(multisigAddress, {
        proposal: { proposal_id: proposalId },
      }),
      signingClient.queryContractSmart(multisigAddress, {
        list_votes: { proposal_id: proposalId },
      }),
    ])
      .then((values) => {
        const [proposal, { votes }] = values;
        setProposal(proposal);
        setVotes(votes);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [multisigAddress, proposalId, timestamp]);

  const handleVote = async (vote: string) => {
    setLoading(true);
    try {
      const response = await signingClient?.execute(
        walletAddress,
        multisigAddress,
        {
          vote: { proposal_id: proposalId, vote },
        },
        'auto'
      );

      setTimestamp(new Date());
      setTransactionHash(response.transactionHash);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUseTemplate = () => {
    router.push(
      `/${encodeURIComponent(multisigAddress)}/create?id=${proposalId}`
    );
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      let executeInstructions: ExecuteInstruction[];
      try {
        let customMsgObjects = JSON.parse(customMsg);
        if (!Array.isArray(customMsgObjects)) {
          customMsgObjects = [customMsgObjects];
        }
        executeInstructions = customMsgObjects.map(({ wasm }) => {
          const { contract_addr: contractAddress, msg, funds } = wasm.execute;
          return {
            contractAddress,
            msg,
            funds,
          } as ExecuteInstruction;
        });
      } catch {
        executeInstructions = [];
      }

      // run execute first
      executeInstructions.unshift({
        contractAddress: multisigAddress,
        msg: {
          execute: { proposal_id: proposalId },
        },
      });

      const response = await signingClient?.executeMultiple(
        walletAddress,
        executeInstructions,
        'auto'
      );

      setTimestamp(new Date());
      setTransactionHash(response.transactionHash);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleClose = async () => {
    setLoading(true);
    try {
      const response = await signingClient?.execute(
        walletAddress,
        multisigAddress,
        {
          close: { proposal_id: proposalId },
        },
        'auto'
      );

      setTimestamp(new Date());
      setTransactionHash(response.transactionHash);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <WalletLoader loading={loading}>
      <div className="flex flex-col w-full">
        <div className="grid bg-base-100 place-items-center">
          {!proposal ? (
            <div className="text-center m-8">
              No proposal with that ID found.
            </div>
          ) : (
            <div className="container mx-auto max-w-lg text-left">
              <h1 className="text-3xl font-bold mb-8">{proposal.title}</h1>
              <p className="mb-8">{proposal.description}</p>
              <div className="p-2 border border-black rounded mb-8">
                <ReactCodeMirror
                  className="max-w-lg"
                  basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                  }}
                  extensions={[json(), EditorView.lineWrapping]}
                  theme="dark"
                  style={{ height: '100%' }}
                  value={JSON.stringify(decodeProto(proposal.msgs), null, 2)}
                  readOnly
                />
              </div>

              <VoteButtons
                onVoteYes={handleVote.bind(null, 'yes')}
                onVoteNo={handleVote.bind(null, 'no')}
                onBack={(e) => {
                  e.preventDefault();
                  router.push(`/${multisigAddress}`);
                }}
                votes={votes}
                walletAddress={walletAddress}
                status={proposal.status}
              />

              {error && (
                <LineAlert className="mt-2" variant="error" msg={error} />
              )}

              {transactionHash.length > 0 && (
                <div className="mt-8">
                  <LineAlert
                    variant="success"
                    link={`https://oraiscan.io/Oraichain/tx/${transactionHash}`}
                    msg={`Success! Transaction Hash: ${transactionHash}`}
                  />
                </div>
              )}

              {proposal.status === 'passed' && (
                <div className="flex justify-between flex-col content-center my-8">
                  <h4 className="mb-2">Execute custom messages:</h4>
                  <widgets.jsoneditor
                    value={customMsg}
                    onChange={setCustomMsg}
                  />
                </div>
              )}

              {proposal.status !== 'open' && (
                <div className="flex justify-between content-center my-8">
                  <button
                    className="box-border px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/${multisigAddress}`);
                    }}
                  >
                    {'< Proposals'}
                  </button>
                  {proposal.status === 'executed' && (
                    <button
                      className="box-border px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleUseTemplate}
                    >
                      Use as template
                    </button>
                  )}
                  {proposal.status === 'passed' && (
                    <button
                      className="box-border px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleExecute}
                    >
                      Execute
                    </button>
                  )}
                  {proposal.status === 'rejected' && (
                    <button
                      className="box-border px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </WalletLoader>
  );
};

export default Proposal;
