import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../../target/types/solsign';
import { assert, expect } from 'chai';
import loadKeypairFromFile from './lib/loadKeypairFromFile';
import sdk from '../../client/solsign';
import sign from '../../client/solsign/instructions/sign';

describe('Signature test', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  const keypair2 = loadKeypairFromFile('./tests/solsign/lib/wallet2.json');
  const signer1 = anchor.web3.Keypair.generate();
  const signer2 = anchor.web3.Keypair.generate();
  const signer3 = anchor.web3.Keypair.generate();
  const signer4 = anchor.web3.Keypair.generate();
  const signer5 = anchor.web3.Keypair.generate();
  const not_a_signer = anchor.web3.Keypair.generate();
  const allKps = [
    keypair2,
    signer1,
    signer2,
    not_a_signer,
    signer3,
    signer4,
    signer5,
  ];
  before('Fund signers', async () => {
    // transfer fund to signers
    const sendTxn = new anchor.web3.Transaction();
    for (var i = 0; i < allKps.length; i++) {
      const ix = anchor.web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: allKps[i].publicKey,
        lamports: anchor.web3.LAMPORTS_PER_SOL * 1,
      });
      sendTxn.add(ix);
    }
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      sendTxn,
      [wallet]
    );
    for (var i = 0; i < allKps.length; i++) {
      const rs = await anchor
        .getProvider()
        .connection.getBalance(allKps[i].publicKey);
    }
  });
  it('Signer can only sign a ACTIVATED document', async () => {
    // Let's create a document
    const { transaction: create_txn, publicKey: documentPDA } =
      await sdk.createDocument(keypair2.publicKey, 'document_uri', [
        signer1.publicKey,
        signer2.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn,
      [keypair2]
    );

    const doc = await sdk.getDocument(documentPDA);
    // Document is in PENDING state
    assert.strictEqual(doc.status, sdk.STATUS.PENDING);

    // Let's sign
    try {
      const sign_txn = await sdk.approve(signer1.publicKey, documentPDA);
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        sign_txn,
        [signer1]
      );
      expect.fail();
    } catch (e) {}
    try {
      const sign_txn = await sdk.reject(signer1.publicKey, documentPDA);
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        sign_txn,
        [signer1]
      );
      expect.fail();
    } catch (e) {}
    // Let's activate the document
    const activate_txn = await sdk.activate(documentPDA, keypair2.publicKey);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      activate_txn,
      [keypair2]
    );
    // signer1 approve
    const sign_txn1 = await sdk.approve(signer1.publicKey, documentPDA);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      sign_txn1,
      [signer1]
    );
    const sign1 = await sdk.getSignature(documentPDA, signer1.publicKey);
    assert.strictEqual(sign1.status, sdk.SIGSTAT.APPROVED);
    // signer2 reject
    const sign_txn2 = await sdk.reject(signer2.publicKey, documentPDA);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      sign_txn2,
      [signer2]
    );
    const sign2 = await sdk.getSignature(documentPDA, signer2.publicKey);
    assert.strictEqual(sign2.status, sdk.SIGSTAT.REJECTED);
  });
  it('Only valid signer can sign', async () => {
    // create document
    const { transaction: create_txn, publicKey: documentPDA } =
      await sdk.createDocument(keypair2.publicKey, 'document_uri', [
        signer1.publicKey,
        signer2.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn,
      [keypair2]
    );
    // activate document
    const activate_txn = await sdk.activate(documentPDA, keypair2.publicKey);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      activate_txn,
      [keypair2]
    );

    // not_a_signer approve, should fail
    try {
      const sign_txn = await sdk.approve(not_a_signer.publicKey, documentPDA);
      await anchor.web3.sendAndConfirmTransaction(
        anchor.getProvider().connection,
        sign_txn,
        [not_a_signer]
      );
      expect.fail();
    } catch (e) {}
  });
  it('List all documents by a signer', async () => {
    // create document 1
    const { transaction: create_txn_1, publicKey: documentPDA_1 } =
      await sdk.createDocument(keypair2.publicKey, 'document_uri', [
        signer3.publicKey,
        signer4.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn_1,
      [keypair2]
    );
    // create document 2
    const { transaction: create_txn_2, publicKey: documentPDA_2 } =
      await sdk.createDocument(keypair2.publicKey, 'document_uri', [
        signer3.publicKey,
        signer4.publicKey,
        signer5.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn_2,
      [keypair2]
    );
    // create document 3
    const { transaction: create_txn_3, publicKey: documentPDA_3 } =
      await sdk.createDocument(keypair2.publicKey, 'document_uri', [
        signer4.publicKey,
      ]);
    await anchor.web3.sendAndConfirmTransaction(
      anchor.getProvider().connection,
      create_txn_3,
      [keypair2]
    );
    // signer3: documentPDA_1, documentPDA_2
    // signer4: documentPDA_1, documentPDA_2, documentPDA_3
    // signer5: documentPDA_3
    const sigOf3 = await sdk.listDocumentBySigner(signer3.publicKey);
    const sigOf4 = await sdk.listDocumentBySigner(signer4.publicKey);
    const sigOf5 = await sdk.listDocumentBySigner(signer5.publicKey);
    console.log(sigOf3);
  });
});
