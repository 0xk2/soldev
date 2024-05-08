import * as anchor from '@coral-xyz/anchor';
import config from '../config';

const listDocumentBySigner = async (
  signer: anchor.web3.PublicKey,
  from = 0,
  size = 10
) => {
  const program = config.getProgram();
  const accounts = program.provider.connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 0, length: 0 },
      filters: [
        {
          memcmp: {
            offset: 8,
            bytes: signer.toBase58(),
          },
        },
      ],
    }
  );
  return accounts;
};

export default listDocumentBySigner;
