import * as anchor from '@coral-xyz/anchor';
import { Solsign as SolsignType } from './types/solsign';
import SolsignIdl from './idls/solsign.json';
const config = {
  provider: undefined,
  program: undefined,
};

const setConfig = ({ provider }: { provider: anchor.Provider }) => {
  config.provider = provider;
  config.program = new anchor.Program(SolsignIdl as anchor.Idl, provider);
};

const getProgram = (): anchor.Program<SolsignType> => {
  return config.program;
};

export default {
  setConfig,
  getProgram,
};
