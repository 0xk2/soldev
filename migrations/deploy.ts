// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor';
import * as borsh from '@coral-xyz/borsh';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import { Solsign } from '../target/types/solsign';

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
  const program = anchor.workspace.Solsign as anchor.Program<Solsign>;
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
  console.log('🔑  Program ID is: ', program.programId.toBase58());
  // Is it existed?
  let shouldContinue = true;
  try {
    const programAccount = await connection.getAccountInfo(program.programId);
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
        program.programId +
        "'"
    );
    const [programDataPDA, b2] = anchor.web3.PublicKey.findProgramAddressSync(
      [program.programId.toBytes()],
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
  let treasury;
  try {
    treasury = loadKeypairFromFile('./migrations/treasury.json');
    console.log('🔑  Treasury is', treasury.publicKey.toBase58());
  } catch (e) {
    console.log('💥 No treasury found');
    shouldContinue = false;
  }
  if (!shouldContinue) {
    return;
  }
  // Check if the treasury is initialized
  const [settingPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('SETTING')],
    program.programId
  );
  let settingAccount;
  try {
    settingAccount = await program.account.setting.fetch(settingPDA);
  } catch (e) {
    console.log("💥 No setting account found, 📦 let' create one.");
    // build the instruction
    const ix = program.instruction.initialize(
      new anchor.BN(1000000),
      treasury.publicKey,
      {
        accounts: {
          user: masterKeyPair.publicKey,
          setting: settingPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
    const txn = new anchor.web3.Transaction();
    txn.add(ix);
    // send the transaction
    const txid = await anchor.web3.sendAndConfirmTransaction(connection, txn, [
      masterKeyPair,
    ]);
    console.log('📦 Setting account created in txn: ', txid);
    // fetch the setting account
    settingAccount = await program.account.setting.fetch(settingPDA);
  }
  console.log('🔑  Setting is: ');
  console.log(
    '🔑🔑  * Fee: ',
    (settingAccount.fee as anchor.BN).toNumber(),
    ' lamports'
  );

  console.log(
    '🔑🔑  * Treasury, where money flow to : ',
    settingAccount.feeCollector.toBase58()
  );
  console.log(
    '🔑🔑  * Owner, who can change setting :',
    settingAccount.owner.toBase58()
  );
};
