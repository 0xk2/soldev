import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solsign } from '../../target/types/solsign';
import { assert } from 'chai';
import loadKeypairFromFile from './lib/loadKeypairFromFile';

describe('Document test', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  it('Signer can only sign a ACTIVATED document', async () => {});
  it('Only valid signer can sign', async () => {});
});
