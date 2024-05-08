import * as anchor from '@coral-xyz/anchor';
import config from '../config';
import getProfile from '../state/get_profile';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';

const createDocument = async (
  creator: anchor.web3.PublicKey,
  uri: string,
  signers: anchor.web3.PublicKey[]
) => {
  const program = config.getProgram();
  let txn = new anchor.web3.Transaction();

  const [profilePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('CREATOR'), creator.toBuffer()],
    program.programId
  );
  const profileInfo = await getProfile(creator);
  const [documentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('DOCUMENT'),
      creator.toBuffer(),
      profileInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  const signaturesPDA = [];
  for (var i = 0; i < signers.length; i++) {
    const sgn = signers[i];
    const [signaturePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('SIGNATURE'), documentPDA.toBuffer(), sgn.toBuffer()],
      program.programId
    );
    signaturesPDA.push({
      pubkey: signaturePDA,
      isWritable: true,
      isSigner: false,
    });
  }
  // create instruction
  const ix = program.instruction.createDocument(uri, signers, {
    accounts: {
      document: documentPDA,
      user: creator,
      profile: profilePDA,
      solsignProgram: program.programId,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    remainingAccounts: signaturesPDA,
  });
  txn.add(ix);
  return {
    transaction: txn,
    index: profileInfo.max.toNumber(),
    publicKey: documentPDA,
  };
};

export default createDocument;
