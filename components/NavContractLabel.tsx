import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSigningClient } from 'contexts/cosmwasm';
import { contracts } from 'util/constants';

function ContractLabel() {
  const router = useRouter();
  const multisigAddress = (router.query.multisigAddress || '') as string;
  const { signingClient } = useSigningClient();
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (contracts[multisigAddress]) {
      if (!label) setLabel(contracts[multisigAddress]);
      return;
    }

    if (multisigAddress.length === 0 || !signingClient) {
      return;
    }

    signingClient.getContract(multisigAddress).then((response) => {
      setLabel(response.label);
    });
  }, [multisigAddress, signingClient]);

  if (label.length === 0) {
    return <div className="flex items-center" />;
  }

  return (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block w-6 h-6 mx-2 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
      <Link href={`/${encodeURIComponent(multisigAddress)}`}>
        <span className="capitalize hover:underline text-2xl">{label}</span>
      </Link>
    </div>
  );
}

export default ContractLabel;
