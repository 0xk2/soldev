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
    const signatures = [];
    for (var i = 0; i < document.signers.length; i++) {
      const [signaturePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('SIGNATURE'),
          documentPDA.toBuffer(),
          document.signers[i].toBuffer(),
        ],
        program.programId
      );
      const signature = await program.account.signature.fetch(signaturePDA);
      signatures.push(signature);
    }
    return { ...document, publicKey: documentPDA, signatures };
  } catch (e) {
    throw new Error('Document not found');
  }
};

export default getDocument;
