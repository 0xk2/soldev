import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import getDocument from './get_document';

const getDocumentByCreatorIndex = async (
  creatorPubK: anchor.web3.PublicKey,
  idx: number
) => {
  const bnIdx = new anchor.BN(idx);
  const [documentPDA, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('DOCUMENT'),
      creatorPubK.toBuffer(),
      bnIdx.toArrayLike(Buffer, 'le', 8),
    ],
    config.getProgram().programId
  );
  try {
    const document = await getDocument(documentPDA);
    return document;
  } catch (e) {
    throw new Error(
      'There is no document for ' +
        creatorPubK.toBase58() +
        ' at ' +
        idx.toString()
    );
  }
};

export default getDocumentByCreatorIndex;
