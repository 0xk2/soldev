import * as anchor from '@coral-xyz/anchor';
import { assert, expect } from 'chai';
import loadKeypairFromFile from './lib/loadKeypairFromFile';
import sdk from '../../client/solsign';

describe('Document test', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  sdk.setConfig({
    provider: anchor.getProvider(),
  });
  const wallet = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  const keypair2 = loadKeypairFromFile('./tests/solsign/lib/wallet2.json');
  const signer1 = anchor.web3.Keypair.generate();
  const signer2 = anchor.web3.Keypair.generate();
  const allKps = [keypair2, signer1, signer2];
  const document_uri = 'creator_document_uri';
  let documentPDA: anchor.web3.PublicKey;
  let documentInfo;
  let old_max;
  let new_max;
  before('Initialize document', async () => {
    const signers = [signer1.publicKey, signer2.publicKey];
    const rs = await sdk.createDocument(
      keypair2.publicKey,
      document_uri,
      signers
    );
    let txn = rs.transaction;
    old_max = rs.index;
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      txn,
      [keypair2]
    );
    const fundTxn = new anchor.web3.Transaction();
    // transfer fund to signers
    allKps.forEach(async (kp) => {
      const ix = anchor.web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: kp.publicKey,
        lamports: 1_000_000_000, // 1 SOL
      });
      fundTxn.add(ix);
    });
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      fundTxn,
      [wallet]
    );
    // get document info
    documentInfo = await sdk.getDocumentByCreatorIndex(
      keypair2.publicKey,
      old_max
    );
    documentPDA = documentInfo.publicKey;
    new_max = (await sdk.getProfile(keypair2.publicKey)).max;
  });
  it('Creator can create document and its status is PENDING', async () => {
    try {
      assert.strictEqual(
        new_max.eq(new anchor.BN(old_max).add(new anchor.BN(1))),
        true
      );
      assert.strictEqual(documentInfo.uri, document_uri);
      assert.strictEqual(documentInfo.status, sdk.STATUS.PENDING);
    } catch (e) {
      assert.fail();
    }
  });
  it('Creator can only change document uri and signers if it is PENDING', async () => {
    const new_uri = 'new_uri';
    if (documentInfo.status !== sdk.STATUS.PENDING) {
      assert.fail();
    } else {
      const txn = await sdk.changeDocumentURI(
        keypair2.publicKey,
        documentPDA,
        new_uri
      );
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        txn,
        [keypair2]
      );
      assert.equal(
        (await sdk.getDocument(documentPDA)).uri,
        new_uri,
        'URI changed to ' + new_uri
      );
    }
  });
  it('Creator cannot annul or activate a document if it is already ANNULLED', async () => {
    const annulFn = async () => {
      const txn = await sdk.annul(documentPDA, keypair2.publicKey);
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        txn,
        [keypair2]
      );
    };
    await annulFn();
    try {
      await annulFn();
      expect.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'Document is not in PENDING state');
    }
  });
  it('Creator can activate a document if it is PENDING', async () => {
    const { transaction: create_txn, publicKey: doc2PDA } =
      await sdk.createDocument(keypair2.publicKey, 'doc2', [
        signer1.publicKey,
        signer2.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn,
      [keypair2]
    );

    const activate_txn = await sdk.activate(doc2PDA, keypair2.publicKey);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      activate_txn,
      [keypair2]
    );

    const doc2 = await sdk.getDocument(doc2PDA);
    assert.strictEqual(doc2.status, sdk.STATUS.ACTIVATED);
  });
  it('Creator can not activate a document if it is ACTIVATED', async () => {
    const { transaction: create_txn, publicKey: doc2PDA } =
      await sdk.createDocument(keypair2.publicKey, 'doc3', [
        signer1.publicKey,
        signer2.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn,
      [keypair2]
    );

    const activate_txn = await sdk.activate(doc2PDA, keypair2.publicKey);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      activate_txn,
      [keypair2]
    );
    try {
      const activate_txn_again = await sdk.activate(
        doc2PDA,
        keypair2.publicKey
      );
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        activate_txn_again,
        [keypair2]
      );
      expect.fail('Cannot activate twice');
    } catch (e) {
      assert.strictEqual(e.message, 'Document is not in PENDING state');
    }
  });
});
