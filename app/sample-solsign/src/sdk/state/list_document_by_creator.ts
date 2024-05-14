import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import getProfile from './get_profile';

/**
 *
 * @param creatorPubK: anchor.web3.PublicKey
 * @param from: from index
 * @param to: to index
 * @returns Array of document PDAs [anchor.web3.PublicKey]
 */
const listDocumentByCreator = async (
  creatorPubK: anchor.web3.PublicKey,
  from: number = 0,
  to: number
) => {
  const profile = await getProfile(creatorPubK);
  const max = profile.max.toNumber();
  if (!to) {
    to = max - 1;
  }
  if (from < 0 || from >= max || to < 0 || to >= max) {
    return [];
  }
  const pdas = [];
  for (var i = from; i <= to; i++) {
    try {
      const [documentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('DOCUMENT'),
          creatorPubK.toBuffer(),
          new anchor.BN(i).toArrayLike(Buffer, 'le', 8),
        ],
        config.getProgram().programId
      );
      pdas.push(documentPDA);
    } catch (e) {
      pdas.push(null);
    }
  }
  return pdas;
};

export default listDocumentByCreator;
