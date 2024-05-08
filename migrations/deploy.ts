// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor';
import * as borsh from '@coral-xyz/borsh';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

export default function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}

module.exports = async function (provider: anchor.Provider) {
  console.log('We invoking this endpoint: ', provider.connection.rpcEndpoint);
  // Configure client to use the provider.
  anchor.setProvider(provider);
  const connection = anchor.getProvider().connection;

  // Add your deploy script here.
  // Check if the program is deployed on the devnet

  const masterKeyPair = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  // Check if the program is initialized
  console.log(
    '🔑 upgrade_authority_address is',
    masterKeyPair.publicKey.toBase58()
  );
  // How many SOL does the master has?
  const balance = await provider.connection.getBalance(masterKeyPair.publicKey);
  console.log('💰 Balance is', balance / 1e9, 'SOL');
  // Initialize the program
  console.log(
    '🔑  Program ID is: ',
    anchor.workspace.Solsign.programId.toBase58()
  );
  // Is it existed?
  let shouldContinue = true;
  try {
    const programAccount = await connection.getAccountInfo(
      anchor.workspace.Solsign.programId
    );
    console.log(
      "📦  Program account' data length is",
      programAccount.data.length,
      ' bytes'
    );
    console.log(
      '📦  The first 4 bytes is identifier and next 32 bytes is PubKey of the ProgramData account'
    );
    const tmp = borsh
      .struct([
        borsh.array(borsh.u8(), 4, 'identifier'),
        borsh.publicKey('programdata_address'),
      ])
      .decode(programAccount.data);
    console.log(
      '📋  Program account point to ProgramData account in ',
      tmp.programdata_address.toBase58(),
      '; the identifier is 4 bytes:',
      tmp.identifier
    );
    console.log(
      "🔑 🔑 🔑 Alternatively, we can get the ProgramData account through a PDA of BPFLoaderUpgrdaeable and see is '" +
        anchor.workspace.Solsign.programId +
        "'"
    );
    const [programDataPDA, b2] = anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.workspace.Solsign.programId.toBytes()],
      new anchor.web3.PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    );
    console.log(
      '🔑 🔑 🔑 The PDA address (should be the same with program.programdata_address) is ' +
        programDataPDA.toBase58()
    );
    // let's see how big the binary is
    const programDataAccount = await connection.getAccountInfo(programDataPDA);
    console.log(
      '📦  ProgramData executable binary size is: ',
      programDataAccount.data.length,
      'bytes, or ',
      programDataAccount.data.length / 1024,
      'KB (kilo bytes)'
    );
  } catch (e) {
    console.log(e);
    console.log(
      '💥 No program found. This program address is newly created. Stop here and keep investigate.'
    );
    shouldContinue = false;
  }
  if (!shouldContinue) {
    return;
  }
  try {
    const treasury = loadKeypairFromFile('./migrations/treasury.json');
    console.log('🔑  Treasury is', treasury.publicKey.toBase58());
  } catch (e) {
    console.log('💥 No treasury found');
    shouldContinue = false;
  }
  if (!shouldContinue) {
    return;
  }
  // Check if the treasury is initialized
};
