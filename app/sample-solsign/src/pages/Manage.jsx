import sdk from '../sdk';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3 } from '@coral-xyz/anchor';
import { useState, useContext } from 'react';
import CreateDoc from '../components/CreateDoc';
import ProfileContext from '../context/Profile';
import sendTxn from '../funcs/sendTxn';
import DocList from '../components/DocList';
// fetch all documents that the person owned

const Manage = () => {
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [data, setData] = useState({
    isLoadingCreateProfile: false,
  });
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const profile = useContext(ProfileContext);

  const createProfile = () => {
    const uri = prompt('Enter your profile URI');
    setData({
      ...data,
      isLoadingCreateProfile: true,
    });
    const ix = sdk.createProfile(
      wallet?.publicKey,
      uri
      //'https://mocki.io/v1/88124758-81cc-4713-98e5-886744352e0a'
    );
    const txn = new web3.Transaction().add(ix);
    sendTxn(connection, txn, wallet)
      .then((signature) => {
        setData({
          isLoadingCreateProfile: false,
        });
        const str =
          'https://explorer.solana.com/tx/' + signature + '?cluster=devnet';
        console.log('createProfile txn: ', str);
        alert(
          'Transaction sent: ' + signature + '. Please wait for confirmation.'
        );
        sdk
          .getProfile(wallet?.publicKey)
          .then((data) => {
            console.log('sdk: ', data);
          })
          .catch(() => {
            setData({
              ...data,
              showCreateProfile: true,
            });
          });
      })
      .catch((err) => {
        console.error('createProfile: ', err);
        alert('Error creating profile. Please try again.');
      })
      .finally(() => {
        setData({
          ...data,
          isLoadingCreateProfile: false,
        });
      });
  };
  return (
    <div>
      <CreateDoc
        showModal={showCreateDoc}
        onClose={() => setShowCreateDoc(false)}
      />
      {wallet ? (
        <div>
          <p>Connected to {wallet?.publicKey.toBase58()}</p>
          {!profile ? (
            <div>
              <button
                className='p-2 bg-gray-200 text-gray-700'
                onClick={createProfile}
              >
                {data.isLoadingCreateProfile ? 'Loading ...' : 'Create profile'}
              </button>
            </div>
          ) : (
            <div>
              <div>Profile stored at {profile.uri}</div>
              <div>Total number of doc: {profile.max.toNumber()}</div>
              <div className='pt-2'>
                <button
                  className='p-2 bg-gray-200 rounded text-gray-700'
                  onClick={() => setShowCreateDoc(true)}
                >
                  Create new Doc
                </button>
              </div>
              <div className='pt-2'>
                <DocList />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>Connect Wallet</div>
      )}
    </div>
  );
};

export default Manage;
