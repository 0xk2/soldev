import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import SIGSTAT from '../state/signature_status';
import STATUS from '../state/document_status';

const _sign = async (
  signer: anchor.web3.PublicKey,
  documentPDA: anchor.web3.PublicKey,
  decision: number
) => {
  const program = config.getProgram();
  let txn = new anchor.web3.Transaction();
  let doc, signature;
  // check if the document exists
  try {
    doc = await program.account.document.fetch(documentPDA);
  } catch (e) {
    throw new Error('Document not found');
  }
  if (doc.status !== STATUS.ACTIVATED) {
    throw new Error('Document is either in PENDING or ANNUL state');
  }
  // get signature PDA
  const [signaturePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('SIGNATURE'), documentPDA.toBuffer(), signer.toBuffer()],
    program.programId
  );
  try {
    signature = await program.account.signature.fetch(signaturePDA);
  } catch (e) {
    throw new Error('Signature NOT existed, document is in malformed state');
  }
  if (signature.status === SIGSTAT.PENDING) {
  } else {
    let msg = signature.status === SIGSTAT.APPROVED ? 'approved' : 'rejected';
    throw new Error('Signature is already signed as ' + msg);
  }
  let ix = program.instruction.signDocument(decision, {
    accounts: {
      document: documentPDA,
      signature: signaturePDA,
      user: signer,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
  });
  txn.add(ix);
  return txn;
};

export const approve = async (
  signer: anchor.web3.PublicKey,
  document: anchor.web3.PublicKey
) => {
  return _sign(signer, document, SIGSTAT.APPROVED);
};

export const reject = async (
  signer: anchor.web3.PublicKey,
  document: anchor.web3.PublicKey
) => {
  return _sign(signer, document, SIGSTAT.REJECTED);
};

export default {
  approve,
  reject,
};
