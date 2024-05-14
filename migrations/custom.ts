import * as anchor from '@coral-xyz/anchor';
import * as borsh from '@coral-xyz/borsh';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

/**
 * To use this file: ts-node ./migrations/custom.ts
 */

export default function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}

const connection = new anchor.web3.Connection(
  'https://api.devnet.solana.com/',
  { commitment: 'max' }
);
const devnetKP = loadKeypairFromFile('./migrations/s1g.json');
const wallet = new anchor.Wallet(devnetKP);
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: 'max',
  preflightCommitment: 'max',
  skipPreflight: false,
});
const custom = async function (provider: anchor.Provider) {
  anchor.setProvider(provider);
  console.log('We invoking this endpoint: ', provider.connection.rpcEndpoint);
  console.log('🔑  Wallet public key is: ', provider.publicKey.toBase58());
  console.log(genAddress(4, ['james', 'James', 'J4m3']));
};

export const genAddress = (l, prefixs) => {
  let addr = '';
  let kp;

  while (!prefixs.includes(addr.substring(0, l))) {
    kp = Keypair.generate();
    addr = kp.publicKey.toBase58();
  }
  return { kp, addr };
};

custom(provider);
