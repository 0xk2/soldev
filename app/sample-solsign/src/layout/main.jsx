import KeyIcon from '../icons/key';
import UploadIcon from '../icons/upload';
import { useLocation } from 'react-router';
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import * as web3 from '@solana/web3.js';
import { useMemo, useState } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import CreateDoc from '../components/CreateDoc';
import { AnchorProvider } from '@coral-xyz/anchor';
import sdk from '../sdk';
import { useEffect } from 'react';
import ProfileContext from '../context/Profile';

// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
  const cluster = import.meta.env.VITE_CLUSTER;
  const endpoint = web3.clusterApiUrl(cluster);
  const wallets = useMemo(() => [], []);

  return (
    <div className='flex flex-col h-screen w-full'>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <Display>{children}</Display>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const Display = ({ children }) => {
  const cluster = import.meta.env.VITE_CLUSTER;
  const location = useLocation();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet, {});
  sdk.setConfig({
    provider,
  });
  const [data, setData] = useState({
    profile: undefined,
  });
  useEffect(() => {
    if (wallet) {
      sdk
        .getProfile(wallet?.publicKey)
        .then((data) => {
          setData({
            ...data,
            profile: data,
          });
        })
        .catch(() => {});
    }
  }, [wallet]);
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  return (
    <>
      {cluster === 'devnet' ? (
        <div className='w-ful text-sm bg-yellow-500 text-center text-black font-bold'>
          Dev net
        </div>
      ) : null}
      <header
        className='bg-gray-900 text-white py-4 px-6 flex items-center justify-between md:px-8 lg:px-10'
        data-id='2'
      >
        <div className='flex items-center gap-4' data-id='3'>
          <a className='flex items-center gap-2' data-id='4' href='/' rel='ugc'>
            <KeyIcon />
            <span
              className='font-semibold text-lg md:text-xl lg:text-2xl mr-4'
              data-id='6'
            >
              SolSign
            </span>
          </a>
          <a
            href='/'
            className={`text-md  hover:text-white ${
              location.pathname === '/'
                ? 'text-gray-500 underline'
                : 'text-gray-100'
            }`}
          >
            Manage
          </a>
          <a
            href='/signatures'
            className={`text-md  hover:text-white ${
              location.pathname === '/signatures'
                ? 'text-gray-500 underline'
                : 'text-gray-100'
            }`}
          >
            Signatures
          </a>
        </div>
        <div className='flex items-center gap-4' data-id='7'>
          <a
            className='inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md px-4 py-2 text-sm font-medium transition-colors'
            data-id='8'
            href='#'
            rel='ugc'
            onClick={() => setShowCreateDoc(true)}
          >
            <UploadIcon />
            Upload Document
          </a>
          <WalletMultiButton />
          <button
            className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden'
            data-id='12'
          >
            <span className='sr-only' data-id='14'>
              Toggle menu
            </span>
          </button>
        </div>
      </header>
      <main className='flex-1 overflow-auto p-4 md:p-6 lg:p-8'>
        <CreateDoc
          showModal={showCreateDoc}
          onClose={() => setShowCreateDoc(false)}
        />
        <ProfileContext.Provider value={data.profile}>
          {children}
        </ProfileContext.Provider>
      </main>
      <footer className='bg-gray-900 text-white py-4 px-6 flex flex-col items-center justify-between gap-4 md:flex-row md:px-8 lg:px-10'>
        <p className='text-sm' data-id='163'>
          © 2023 Document Manager. All rights reserved.
        </p>
        <div className='flex items-center gap-4' data-id='164'>
          <a
            className='text-sm hover:underline'
            data-id='165'
            href='#'
            rel='ugc'
          >
            Privacy Policy
          </a>
          <a
            className='text-sm hover:underline'
            data-id='166'
            href='#'
            rel='ugc'
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </>
  );
};

export default Layout;
