import * as anchor from '@coral-xyz/anchor';
import config from '../config';

const listDocumentBySigner = async (
  signer: anchor.web3.PublicKey,
  offset = 0,
  size = 10
) => {
  const program = config.getProgram();
  const accounts = await program.provider.connection.getProgramAccounts(
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
  const data = [];
  const last =
    offset + size > accounts.length ? accounts.length : offset + size;
  for (var i = offset; i < last; i++) {
    const sgn = await program.account.signature.fetch(accounts[i].pubkey);
    data.push({ ...sgn, publicKey: accounts[i].pubkey.toBase58() });
  }
  const result = {
    pagination: {
      offset,
      size,
      total: accounts.length,
    },
    data: data,
  };
  return result;
};

export default listDocumentBySigner;
