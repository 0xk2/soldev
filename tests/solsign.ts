import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../target/types/solsign';
import loadKeypairFromFile from './solsign/lib/loadKeypairFromFile';
/// TODO: these tests are for the client/js code, not the anchor program
describe('Test for solsign', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Solsign as Program<Solsign>;
  const systemProgram = anchor.web3.SystemProgram;
  const treasury = anchor.web3.Keypair.generate();
  const wallet = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  const [settingPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('SETTING')],
    program.programId
  );
  const wallet2 = loadKeypairFromFile('./tests/solsign/lib/wallet2.json');
  before(async () => {
    await program.methods
      .initialize(new anchor.BN(0), treasury.publicKey)
      .accounts({
        user: wallet.publicKey,
        setting: settingPDA,
        // systemProgram: systemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    try {
      const settingInfo = await program.account.setting.fetch(settingPDA);
    } catch (e) {}
    let txn = new anchor.web3.Transaction();
    txn.add(
      systemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet2.publicKey,
        lamports: 10_000_000_000, // 10 SOL
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      program.provider.connection,
      txn,
      [wallet]
    );
    console.log('  ** Setup done! **');
  });
  require('./solsign/setting.test');
  require('./solsign/creator_profile.test');
  require('./solsign/document.test');
  require('./solsign/signature.test');
});
