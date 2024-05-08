import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';

/**
 * @param documentPDA: anchor.web3.PublicKey
 * @returns document: {status: Number, signers: [anchor.web3.PublicKey], uri: String}
 */
const getDocument = async (documentPDA: anchor.web3.PublicKey) => {
  const program = config.getProgram();
  try {
    const document = await program.account.document.fetch(documentPDA);
    return { ...document, publicKey: documentPDA };
  } catch (e) {
    throw new Error('Document not found');
  }
};

export default getDocument;
