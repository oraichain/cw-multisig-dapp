interface Window {
  keplr: any;
  getOfflineSigner: Function;
}

// TODO: review union Expiration from types/cw3
type Expiration = {
  at_height?: number;
  at_time?: Timestamp;
};

type Member = {
  addr: string;
  weight: number;
};
