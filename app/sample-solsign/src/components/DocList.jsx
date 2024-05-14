import { useContext, useEffect, useState } from 'react';
import ProfileContext from '../context/Profile';
import sdk from '../sdk';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import sendTxn from '../funcs/sendTxn';

const renderSignatureStatus = (status) => {
  switch (status) {
    case sdk.SIGSTAT.PENDING:
      return '🔔';
    case sdk.SIGSTAT.SIGNED:
      return '✅';
    case sdk.SIGSTAT.REJECTED:
      return '❌';
    default:
      return '❓';
  }
};
// eslint-disable-next-line react/prop-types
const Doc = ({ doc }) => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const activate = async () => {
    const txn = await sdk.activate(doc.publicKey, wallet.publicKey);
    sendTxn(connection, txn, wallet)
      .then((data) => {
        console.log('activate txn: ', data);
        alert('Transaction sent: ' + data + '. Please wait for confirmation.');
      })
      .catch((e) => {
        console.error('activate: ', e);
        alert('Error activating document. Please try again.');
      });
  };
  const annul = async () => {
    const txn = await sdk.annul(doc.publicKey, wallet.publicKey);
    sendTxn(connection, txn, wallet)
      .then((data) => {
        console.log('activate txn: ', data);
        alert('Transaction sent: ' + data + '. Please wait for confirmation.');
      })
      .catch((e) => {
        console.error('activate: ', e);
        alert('Error activating document. Please try again.');
      });
  };
  const renderStatus = (status) => {
    switch (status) {
      case sdk.STATUS.PENDING:
        return (
          <div className='ml-2 grid grid-flow-col auto-cols-max gap-2 '>
            📝
            <a className='cursor-pointer' onClick={activate}>
              Activate
            </a>
            <a className='cursor-pointer' onClick={annul}>
              Anull
            </a>
          </div>
        );
      case sdk.STATUS.ACTIVATED:
        return (
          <div className='ml-2 grid grid-flow-col auto-cols-max gap-2 '>
            ✅
            <a className='cursor-pointer' onClick={annul}>
              Anull
            </a>
          </div>
        );
      case sdk.STATUS.ANULLED:
        return (
          <div className='ml-2 grid grid-flow-col auto-cols-max gap-2 '>❌</div>
        );
      default:
        return '❓';
    }
  };
  return (
    <div className='my-2'>
      <div className='flex'>
        Doc URI: {doc.uri} {renderStatus(doc.status)}
      </div>

      <div className='font-bold'>Signers:</div>

      {(doc?.signatures || []).map((signature, key) => {
        return (
          <div key={`doc-${key}`} className='py-2'>
            <div>
              {renderSignatureStatus(signature.status)}{' '}
              {signature.signer.toBase58()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DocList = () => {
  const profile = useContext(ProfileContext);
  const [data, setData] = useState({
    loading: false,
    docs: [],
  });
  useEffect(() => {
    if (profile) {
      sdk.listDocumentByCreator(profile?.owner).then(async (pdas) => {
        setData({
          loading: true,
          docs: [],
        });
        const docs = [];
        for (var i = 0; i < pdas.length; i++) {
          const doc = await sdk.getDocument(pdas[i]);
          docs.push(doc);
        }
        setData({
          loading: false,
          docs,
        });
      });
    }
  }, [profile]);
  return (
    <div className='mt-2'>
      {data.loading ? <div className='my-2 font-bold'>Loading ...</div> : null}
      {data.docs?.map((doc, key) => {
        return (
          <div key={key}>
            <Doc doc={doc} />
            {key < data.docs.length - 1 ? (
              <div className='w-full h-[1px] bg-gray-400' />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default DocList;
