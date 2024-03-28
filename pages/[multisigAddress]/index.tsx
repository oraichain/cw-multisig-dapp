import type { NextPage } from 'next';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProposalCard from 'components/ProposalCard';
import { ProposalListResponse, ProposalResponse, Timestamp } from 'types/cw3';
import { PUBLIC_CHAIN_ID } from 'hooks/cosmwasm';
import { users } from 'util/constants';

const Home: NextPage = () => {
  const router = useRouter();
  const multisigAddress = router.query.multisigAddress as string;
  const [voters, setVoters] = useState<Member[]>([]);
  const { walletAddress, signingClient } = useSigningClient();
  const [reversedProposals, setReversedProposals] = useState<
    ProposalResponse[]
  >([]);
  const [hideLoadMore, setHideLoadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startBefore, setStartBefore] = useState<number | null>(null);

  const getExpiresAt = (expires: Expiration) => {
    return expires.at_time
      ? new Date(parseInt(expires.at_time) / 1000000).toLocaleString()
      : 'block ' + new Intl.NumberFormat().format(expires.at_height);
  };

  useEffect(() => {
    if (!signingClient || !multisigAddress) {
      return;
    }
    // max return is 30
    signingClient
      .queryContractSmart(multisigAddress, {
        list_voters: { limit: 30 },
      })
      .then((data) => {
        setVoters(data.voters);
      })
      .catch((err) => {
        console.log('err', err);
      });
  }, [!!signingClient, multisigAddress]);

  useEffect(() => {
    if (!signingClient || !multisigAddress) {
      setReversedProposals([]);
      setHideLoadMore(false);
      return;
    }

    setLoading(true);

    signingClient
      .queryContractSmart(multisigAddress, {
        reverse_proposals: {
          ...(startBefore && { start_before: startBefore }),
          limit: 10,
        },
      })
      .then((response: ProposalListResponse) => {
        if (response.proposals.length < 10) {
          setHideLoadMore(true);
        }
        setReversedProposals([
          ...new Map(
            reversedProposals.concat(response.proposals).map((p) => [p.id, p])
          ).values(),
        ]);
      })
      .catch((err) => {
        console.log('err', err);
      })
      .finally(() => setLoading(false));
  }, [!!signingClient, multisigAddress, startBefore]);

  return (
    <WalletLoader loading={reversedProposals.length === 0 && loading}>
      <div className="flex flex-col w-96 lg:w-6/12 max-w-full">
        <h1 className="text-left text-lg font-bold sm:text-3xl px-2 py-4">
          Weight - Members
        </h1>
        <div className="w-full">
          {voters.map((member) => {
            let voter = member.addr;
            if (voter === walletAddress) {
              voter = 'You (' + walletAddress + ')';
            } else if (users[voter]) {
              voter = users[voter] + ' (' + voter + ')';
            }
            return (
              <a
                key={member.addr}
                href={`https://oraiscan.io/${PUBLIC_CHAIN_ID}/account/${member.addr}`}
                target="_blank"
              >
                <div className={`card mb-4`}>
                  <div className="card-body p-2">
                    <div className="text-md truncate m-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900 mr-4">
                        {member.weight}
                      </span>
                      {voter}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col w-96 lg:w-6/12 max-w-full px-2 py-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-lg font-bold sm:text-3xl">ID - Proposals</h1>
          {voters.some((m) => m.addr === walletAddress) && (
            <button
              className="btn btn-primary btn-sm text-lg"
              onClick={() =>
                router.push(`/${encodeURIComponent(multisigAddress)}/create`)
              }
            >
              + Create
            </button>
          )}
        </div>
      </div>
      <div className="w-96 lg:w-6/12 max-w-full">
        {reversedProposals.length === 0 && (
          <div className="text-center">
            No proposals found, please create a proposal.
          </div>
        )}
        {reversedProposals.map((proposal, idx) => {
          const { title, id, status } = proposal;
          const expires = proposal.expires as Expiration;

          return (
            <ProposalCard
              key={id}
              title={title}
              id={`${id}`}
              status={status}
              expires_at={getExpiresAt(expires)}
              multisigAddress={multisigAddress}
            />
          );
        })}
        {!hideLoadMore && (
          <button
            className="btn btn-primary btn-outline text-lg w-full mt-2"
            onClick={() => {
              const proposal = reversedProposals[reversedProposals.length - 1];
              setStartBefore(proposal.id);
            }}
          >
            Load More
          </button>
        )}
      </div>
      <div></div>
    </WalletLoader>
  );
};

export default Home;
