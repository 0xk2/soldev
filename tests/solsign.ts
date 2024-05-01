import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../target/types/solsign';
import { assert } from 'chai';

describe('solsign - Onchain DocuSign', () => {
  // Configure the client to use the local cluster.
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
  const wallet2 = anchor.web3.Keypair.generate();
  before(async () => {
    await program.methods
      .initialize(new anchor.BN(0), treasury.publicKey)
      .accounts({
        setting: settingPDA,
        user: wallet.publicKey,
        systemProgram: systemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    try {
      const settingInfo = await program.account.setting.fetch(settingPDA);
      console.log('Setting account', settingInfo);
    } catch (e) {}
    let txn = new anchor.web3.Transaction();
    txn.add(
      systemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet2.publicKey,
        lamports: 1000000,
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      program.provider.connection,
      txn,
      [wallet]
    );
  });
  it('Owner can change fee!', async () => {
    await program.methods
      .changeFee(new anchor.BN(100))
      .accounts({
        setting: settingPDA,
        user: wallet.publicKey,
        systemProgram: systemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    const settingInfo = await program.account.setting.fetch(settingPDA);
    assert.ok(settingInfo.fee.eq(new anchor.BN(100)));
  });
  it('Non-owner cannot change fee!', async () => {
    try {
      await program.methods
        .changeFee(new anchor.BN(200))
        .accounts({
          setting: settingPDA,
          user: wallet2.publicKey,
          systemProgram: systemProgram.programId,
        })
        .signers([wallet2]);
      assert.ok(false);
    } catch (e) {
      assert.ok(true);
    }
  });
  // it('Owner can change treasury!', async () => {});
  // it('Non-owner cannot change treasury!', async () => {});
});
