import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Rpg } from '../target/types/rpg';
import { assert } from 'chai';

describe('rpg', () => {
  // Config the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Rpg as Program<Rpg>;
  const wallet = anchor.workspace.Rpg.provider.wallet
    .payer as anchor.web3.Keypair;
  const gameMaster = wallet;
  const player = wallet;

  const treasury = anchor.web3.Keypair.generate();

  it('Create Game', async () => {
    const [gameKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('GAME'), treasury.publicKey.toBuffer()],
      program.programId
    );

    const txnHash = await program.methods
      .createGame(8)
      .accounts({
        game: gameKey,
        gameMaster: gameMaster.publicKey,
        treasury: treasury.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([treasury])
      .rpc();

    await program.provider.connection.confirmTransaction(txnHash);
  });

  it('Create Player', async () => {});

  it('Spawn Monster', async () => {});

  it('Attack Monster', async () => {});

  it('Deposit Action Points', async () => {});
});
