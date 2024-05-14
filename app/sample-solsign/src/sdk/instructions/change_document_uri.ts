import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import STATUS from '../state/document_status';

const changeDocumentURI = async (
  creator: anchor.web3.PublicKey,
  documentPDA: anchor.web3.PublicKey,
  uri: string
) => {
  const program = config.getProgram();
  let txn = new anchor.web3.Transaction();

  const document = await program.account.document.fetch(documentPDA);
  if (document.status !== STATUS.PENDING) {
    throw new Error(
      'Document is either in ACTIVATED or ANNUL state, cannot change uri'
    );
  }
  // create instruction
  let ix = program.instruction.editDocumentUri(uri, {
    accounts: {
      document: documentPDA,
      user: creator,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
  });
  txn.add(ix);
  return txn;
};

export default changeDocumentURI;
