import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../../target/types/solsign';
import { assert } from 'chai';
import loadKeypairFromFile from './lib/loadKeypairFromFile';

import sdk from '../../client/solsign';

describe('Creator profile test', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const keypair2 = loadKeypairFromFile('./tests/solsign/lib/wallet2.json');
  sdk.setConfig({
    provider: anchor.getProvider(),
  });

  it('Creator can create profile', async () => {
    const uri = 'wallet2_uri';
    const txn = await sdk.createProfile(keypair2.publicKey, uri);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      txn,
      [keypair2]
    );
    try {
      const profile = await sdk.getProfile(keypair2.publicKey);
      assert.equal(profile.uri, uri);
      assert.strictEqual(profile.max.eq(new anchor.BN(0)), true);
      assert.equal(profile.owner.toBase58(), keypair2.publicKey.toBase58());
    } catch (e) {
      console.log(e);
      assert.fail();
    }
  });

  it('Creator can change profile uri', async () => {
    const newUri = 'new_wallet2_uri';
    const txn = await sdk.changeProfileUri(keypair2.publicKey, newUri);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      txn,
      [keypair2]
    );
    try {
      const profile = await sdk.getProfile(keypair2.publicKey);
      assert.equal(profile.uri, newUri);
    } catch (e) {
      assert.fail();
    }
  });

  it('Create a document will increase max by one', async () => {
    const signer1 = anchor.web3.Keypair.generate();
    const signer2 = anchor.web3.Keypair.generate();
    const signer3 = anchor.web3.Keypair.generate();
    const signers = [signer1.publicKey, signer2.publicKey, signer3.publicKey];
    const document_uri = 'document_uri';
    const { transaction: txn } = await sdk.createDocument(
      keypair2.publicKey,
      document_uri,
      signers
    );
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      txn,
      [keypair2]
    );
    try {
      const profile = await sdk.getProfile(keypair2.publicKey);
      assert.strictEqual(profile.max.eq(new anchor.BN(1)), true);
    } catch (e) {
      assert.fail();
    }
  });
});
