import sdk from '../sdk';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSearchParams } from 'react-router-dom';
import sendTxn from '../funcs/sendTxn';
import Loading from './Loading';

const renderDocStatus = (status) => {
  console.log('doc status', status);
  switch (status) {
    case sdk.STATUS.PENDING:
      return '🔔';
    case sdk.STATUS.ACTIVATED:
      return '✅';
    case sdk.STATUS.ANULLED:
      return '❌';
    default:
      return '❓';
  }
};

const renderSignatureStatus = (status) => {
  switch (status) {
    case sdk.SIGSTAT.PENDING:
      return '🔔';
    case sdk.SIGSTAT.APPROVED:
      return '✅';
    case sdk.SIGSTAT.REJECTED:
      return '❌';
    default:
      return '❓';
  }
};

const SignatureList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const offset = searchParams.get('offset') || 0;
  const size = 2;
  const [pagination, setPagination] = useState({});
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rCounter, setRCounter] = useState(0);

  const agree = async (docPDA) => {
    setLoading(true);
    sendTxn(connection, await sdk.approve(wallet.publicKey, docPDA), wallet)
      .then((data) => {
        console.log('approve txn: ', data);
        alert('Transaction sent: ' + data + '. Please wait for confirmation.');
        setLoading(false);
        setRCounter(rCounter + 1);
      })
      .catch((e) => {
        console.error('approve: ', e);
        setLoading(false);
        alert('Error approving document. Please try again.');
      });
  };
  const reject = async (docPDA) => {
    setLoading(true);
    sendTxn(connection, await sdk.reject(wallet.publicKey, docPDA), wallet)
      .then((data) => {
        console.log('approve txn: ', data);
        alert('Transaction sent: ' + data + '. Please wait for confirmation.');
        setLoading(false);
        setRCounter(rCounter + 1);
      })
      .catch((e) => {
        console.error('approve: ', e);
        setLoading(false);
        alert('Error approving document. Please try again.');
      });
  };

  useEffect(() => {
    const getList = async () => {
      if (!wallet) return;
      const rs = await sdk.listDocumentBySigner(
        wallet?.publicKey,
        offset,
        size
      );
      for (var i = 0; i < rs.data.length; i++) {
        const pda = await sdk.getDocument(rs.data[i].doc);
        rs.data[i].document = pda;
      }
      setPagination({
        offset: parseInt(rs.pagination.offset),
        size: parseInt(rs.pagination.size),
        total: parseInt(rs.pagination.total),
      });
      setSignatures(rs.data);
      setLoading(false);
    };
    setLoading(true);
    getList();
  }, [wallet, offset, rCounter]);
  return (
    <div>
      {loading ? (
        wallet ? (
          <div>
            <Loading />
          </div>
        ) : (
          <div>Please connect wallet</div>
        )
      ) : (
        <>
          <div className='text-center'>
            {pagination.offset >= pagination.size ? (
              <a
                className='mx-2 cursor-pointer'
                onClick={() => {
                  setSearchParams({
                    offset: pagination.offset - pagination.size,
                  });
                }}
              >
                ←
              </a>
            ) : null}
            From {pagination.offset} to {pagination.offset + pagination.size},
            Total {pagination.total}
            {pagination.offset + pagination.size <= pagination.total ? (
              <a
                className='mx-2 cursor-pointer'
                onClick={() => {
                  setSearchParams({
                    offset: pagination.offset + pagination.size,
                  });
                }}
              >
                →
              </a>
            ) : null}
          </div>
          <div>
            {signatures.map((sig, key) => {
              console.log(sig);
              return (
                <div key={`doc-${key}`} className='my-2 grid gap-2 '>
                  <div>
                    Document URI: {sig.document.uri}{' '}
                    {renderDocStatus(sig.document.status)}
                  </div>
                  <div>
                    <div className='font-bold'>Signers:</div>
                    {sig.document.signatures.map((signature, key) => {
                      return (
                        <div key={`doc-${key}`} className='py-2 flex'>
                          <div className='flex items-center'>
                            <div className='mx-2'>
                              {renderSignatureStatus(signature.status)}{' '}
                              {signature.signer.toBase58()}
                            </div>
                            {signature.signer.toBase58() ==
                              wallet?.publicKey.toBase58() &&
                            signature.status === sdk.SIGSTAT.PENDING &&
                            sig.document.status == sdk.STATUS.ACTIVATED ? (
                              <div className='flex items-center'>
                                <button
                                  className='p-2 border-green-500 mr-2'
                                  onClick={() => {
                                    agree(sig.doc);
                                  }}
                                >
                                  Agree
                                </button>
                                <button
                                  className='p-2 border-red-500'
                                  onClick={() => {
                                    reject(sig.doc);
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {key < signatures.length - 1 ? <hr /> : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SignatureList;
