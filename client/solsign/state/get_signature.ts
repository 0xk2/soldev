import * as anchor from '@coral-xyz/anchor';
import config from '../config';

const getSignature = async (
  documentPDA: anchor.web3.PublicKey,
  signerPubK: anchor.web3.PublicKey
) => {
  const [signaturePDA, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('SIGNATURE'), documentPDA.toBuffer(), signerPubK.toBuffer()],
    config.getProgram().programId
  );
  try {
    const signature = await config
      .getProgram()
      .account.signature.fetch(signaturePDA);
    return signature;
  } catch (e) {
    throw new Error(
      'There is no content for ' +
        signaturePDA.toBase58() +
        ', please create one'
    );
  }
};

export default getSignature;
