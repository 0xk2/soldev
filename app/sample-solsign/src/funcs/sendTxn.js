const sendTxn = async (connection, transaction, feePayer) => {
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = feePayer.publicKey;
  console.log('in sendTxn ; transaction: ', transaction);
  const signedTransaction = await feePayer.signTransaction(transaction);
  console.log('signedTransaction: ', signedTransaction);
  console.log('feePayer: ', feePayer);
  const sendOptions = {
    skipPreflight: false,
    preflightCommitment: 'finalized',
    maxRetries: 10,
  };
  return connection.sendRawTransaction(
    signedTransaction.serialize(),
    sendOptions
  );
};

export default sendTxn;
