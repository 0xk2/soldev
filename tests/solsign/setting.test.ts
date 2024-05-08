import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../../target/types/solsign';
import { assert } from 'chai';
import loadKeypairFromFile from './lib/loadKeypairFromFile';

describe('Setting test', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Solsign as Program<Solsign>;
  const systemProgram = anchor.web3.SystemProgram;
  const wallet = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  const [settingPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('SETTING')],
    program.programId
  );
  const wallet2 = loadKeypairFromFile('./tests/solsign/lib/wallet2.json');
  // note: systemProgram is passed by default
  it('Owner can change fee or treasury!', async () => {
    await program.methods
      .changeFee(new anchor.BN(100))
      .accounts({
        setting: settingPDA,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();
    let settingInfo;
    settingInfo = await program.account.setting.fetch(settingPDA);
    assert.ok(settingInfo.fee.eq(new anchor.BN(100)));
    // generate a random wallet
    const newTreasury = anchor.web3.Keypair.generate().publicKey;
    await program.methods
      .changeTreasury(newTreasury)
      .accounts({
        setting: settingPDA,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();
    settingInfo = await program.account.setting.fetch(settingPDA);
    assert.equal(settingInfo.feeCollector.toBase58(), newTreasury.toBase58());
  });
  it('Non-owner cannot change fee or treasury!', async () => {
    try {
      await program.methods
        .changeFee(new anchor.BN(200))
        .accounts({
          setting: settingPDA,
          user: wallet2.publicKey,
        })
        .signers([wallet2]);
      assert.ok(false);
    } catch (e) {
      assert.ok(true);
    }
    try {
      // generate a random wallet
      const newTreasury = anchor.web3.Keypair.generate().publicKey;
      await program.methods
        .changeTreasury(newTreasury)
        .accounts({
          setting: settingPDA,
          user: wallet2.publicKey,
        })
        .signers([wallet2]);
      assert.ok(false);
    } catch (e) {
      assert.ok(true);
    }
  });
  it('Can change owner and New Owner can change fee or treasury', async () => {
    const newOwner = wallet2;
    await program.methods
      .changeOwner(newOwner.publicKey)
      .accounts({
        setting: settingPDA,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();
    let settingInfo;
    settingInfo = await program.account.setting.fetch(settingPDA);
    assert.equal(settingInfo.owner.toBase58(), newOwner.publicKey.toBase58());
    await program.methods
      .changeFee(new anchor.BN(100))
      .accounts({
        setting: settingPDA,
        user: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();
    settingInfo = await program.account.setting.fetch(settingPDA);
    assert.ok(settingInfo.fee.eq(new anchor.BN(100)));
    // generate a random wallet
    const newTreasury = anchor.web3.Keypair.generate().publicKey;
    await program.methods
      .changeTreasury(newTreasury)
      .accounts({
        setting: settingPDA,
        user: newOwner.publicKey,
      })
      .signers([newOwner])
      .rpc();
    settingInfo = await program.account.setting.fetch(settingPDA);
    assert.equal(settingInfo.feeCollector.toBase58(), newTreasury.toBase58());
  });
});
