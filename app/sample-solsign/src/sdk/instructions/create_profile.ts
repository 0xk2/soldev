import * as anchor from '@coral-xyz/anchor';
import config from '../config';

const createProfile = (creator: anchor.web3.PublicKey, uri: string) => {
  const program = config.getProgram();
  let txn = new anchor.web3.Transaction();

  const [profilePDA, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('CREATOR'), creator.toBuffer()],
    program.programId
  );
  // create instruction
  let ix = program.instruction.createCreator(uri, {
    accounts: {
      profile: profilePDA,
      user: creator,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
  });
  txn.add(ix);

  return txn;
};

export default createProfile;
