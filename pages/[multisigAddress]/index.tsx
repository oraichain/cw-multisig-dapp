import type { NextPage } from 'next';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProposalCard from 'components/ProposalCard';
import { ProposalListResponse, ProposalResponse, Timestamp } from 'types/cw3';
import { PUBLIC_CHAIN_ID } from 'hooks/cosmwasm';

// TODO: review union Expiration from types/cw3
type Expiration = {
  at_height?: number;
  at_time?: Timestamp;
};

type Member = {
  addr: string;
  weight: number;
};

const Home: NextPage = () => {
  const router = useRouter();
  const multisigAddress = router.query.multisigAddress as string;
  const [members, setMembers] = useState<Member[]>([]);
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
    if (walletAddress.length === 0 || !signingClient) {
      setReversedProposals([]);
      setHideLoadMore(false);
      return;
    }

    setLoading(true);
    Promise.all([
      signingClient.queryContractSmart(multisigAddress, {
        reverse_proposals: {
          ...(startBefore && { start_before: startBefore }),
          limit: 10,
        },
      }),
      signingClient.queryContractSmart(multisigAddress, {
        config: {},
      }),
    ])
      .then(
        ([response, config]: [
          ProposalListResponse,
          { group_addr: string }
        ]) => {
          if (response.proposals.length < 10) {
            setHideLoadMore(true);
          }
          setReversedProposals([
            ...new Map(
              reversedProposals.concat(response.proposals).map((p) => [p.id, p])
            ).values(),
          ]);

          signingClient
            .queryContractSmart(config.group_addr, {
              list_members: {},
            })
            .then((data) => {
              setMembers(data.members);
            })
            .catch((err) => {
              console.log('err', err);
            });
        }
      )
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        console.log('err', err);
      });
  }, [walletAddress, signingClient, multisigAddress, startBefore]);

  return (
    <WalletLoader loading={reversedProposals.length === 0 && loading}>
      <div className="flex flex-col w-96 lg:w-6/12 max-w-full px-2 py-4">
        <h1 className="text-left text-lg font-bold sm:text-3xl">
          Weight - Members
        </h1>
        <div className="w-full">
          {members.map((member) => (
            <a
              key={member.addr}
              href={`https://oraiscan.io/${PUBLIC_CHAIN_ID}/account/${member.addr}`}
              target="_blank"
            >
              <div className={`card mb-4`}>
                <div className="card-body py-4 px-2">
                  <div className="text-md truncate m-0">
                    {member.weight} - {member.addr}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-96 lg:w-6/12 max-w-full px-2 py-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-lg font-bold sm:text-3xl">ID - Proposals</h1>
          {members.some((m) => m.addr === walletAddress) && (
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
