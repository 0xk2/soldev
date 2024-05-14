import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import STATUS from '../state/document_status';
import getDocument from '../state/get_document';

const changeDocumentStatus = async (
  documentPDA: anchor.web3.PublicKey,
  status: number,
  creator: anchor.web3.PublicKey
) => {
  if (status !== STATUS.ACTIVATED && status !== STATUS.ANULLED) {
    throw new Error('Invalid status');
  }
  const document = await getDocument(documentPDA);
  if (document.status !== STATUS.PENDING) {
    throw new Error('Document is not in PENDING state');
  }
  const program = config.getProgram();
  let txn = new anchor.web3.Transaction();
  if (status === STATUS.ACTIVATED) {
    let ix = program.instruction.activateDocument({
      accounts: {
        document: documentPDA,
        user: creator,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });
    txn.add(ix);
  } else if (status === STATUS.ANULLED) {
    let ix = program.instruction.anullDocument({
      accounts: {
        document: documentPDA,
        user: creator,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });
    txn.add(ix);
  }
  return txn;
};

export const activate = async (
  documentPDA: anchor.web3.PublicKey,
  creator: anchor.web3.PublicKey
) => {
  return changeDocumentStatus(documentPDA, STATUS.ACTIVATED, creator);
};
export const annul = async (
  documentPDA: anchor.web3.PublicKey,
  creator: anchor.web3.PublicKey
) => {
  return changeDocumentStatus(documentPDA, STATUS.ANULLED, creator);
};

export default { activate, annul };
