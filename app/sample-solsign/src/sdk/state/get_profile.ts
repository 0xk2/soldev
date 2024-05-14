import * as anchor from '@coral-xyz/anchor';
import config from '../config';

const getProfile = async (creatorPubK: anchor.web3.PublicKey) => {
  const [profilePDA, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('CREATOR'), creatorPubK.toBuffer()],
    config.getProgram().programId
  );
  try {
    const profile = await config
      .getProgram()
      .account.creatorProfile.fetch(profilePDA);
    return profile;
  } catch (e) {
    throw new Error(
      'There is no profile for ' +
        creatorPubK.toBase58() +
        ', please create one'
    );
  }
};

export default getProfile;
