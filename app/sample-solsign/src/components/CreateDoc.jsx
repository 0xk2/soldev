import { useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import sdk from '../sdk';
import { PublicKey } from '@solana/web3.js';
import sendTxn from '../funcs/sendTxn';
// eslint-disable-next-line react/prop-types
const CreateDoc = ({ showModal, onClose, successCallback }) => {
  const [signers, setSigners] = useState([]);
  const [uri, setUri] = useState('');
  const [newSigner, setNewSigner] = useState('');
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  return (
    <div
      onClick={(e) => {
        onClose();
        setUri('');
        setSigners([]);
        setNewSigner('');
        e.stopPropagation();
      }}
    >
      {showModal ? (
        <div className='absolute w-full h-full top-0 left-0 bg-gray-500/50 flex place-content-center text-gray-700'>
          <div
            className='mt-20 w-[400px] h-[400px] bg-white items-center text-center border-1 rounded overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-hidden'
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className='p-2 font-bold text-xl'>Create document</div>
            <div className='flex items-center pl-4'>
              <div className='text-left w-[150px]'>Document URI</div>
              <input
                type='text'
                placeholder='Document URI'
                value={uri}
                onChange={(e) => {
                  setUri(e.target.value);
                }}
                className='p-2 mx-2 bg-white border-1'
              />
            </div>
            <div className='flex items-center pl-4 font-bold'>Signers</div>
            <div className='flex items-center pl-4 border-1 items-center'>
              New Signers{' '}
              <input
                className='ml-2 pl-2 mr-2 bg-white border-1'
                type='text'
                placeholder='Signer'
                value={newSigner}
                onChange={(e) => {
                  setNewSigner(e.target.value);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <button
                onClick={() => {
                  setSigners([...signers, newSigner]);
                  setNewSigner('');
                }}
                className='bg-green-200 p-2 text-gray-700'
              >
                Add
              </button>
            </div>
            {signers.map((signer, index) => {
              return (
                <div key={index} className='flex items-center pl-4 py-2'>
                  <button
                    className='bg-red-200 p-2'
                    onClick={() => {
                      const tmp = signers.filter((s) => s !== signer);
                      setSigners([...tmp]);
                    }}
                  >
                    Delete
                  </button>{' '}
                  <div
                    className='ml-2 w-2/3 text-clip overflow-x-hidden'
                    title={signer}
                  >
                    {signer?.substring(0, 5)}
                    {'...'}
                    {signer?.substring(signer?.length - 5, signer?.length - 1)}
                  </div>
                </div>
              );
            })}
            <div>
              <button
                className='w-3/4 bg-green-200 p-2 mt-4 text-gray-700'
                onClick={() => {
                  if (signers.length === 0) {
                    alert('Please add at least one signer');
                    return;
                  }
                  const _signers = [];
                  for (var i = 0; i < signers.length; i++) {
                    _signers.push(new PublicKey(signers[i]));
                  }
                  sdk
                    .createDocument(wallet.publicKey, uri, _signers)
                    .then((result) => {
                      console.log('result: ', result);
                      sendTxn(connection, result.transaction, wallet)
                        .then(() => {
                          alert('Document created successfully');
                          if (successCallback) {
                            successCallback();
                          }
                        })
                        .catch((e) => {
                          console.log(e);
                          alert('Error sending transaction. Please try again.');
                        });
                    })
                    .catch(() => {
                      alert('Error creating document. Please try again.');
                    })
                    .finally(() => {
                      onClose();
                    });
                }}
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CreateDoc;
