import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Soldev } from '../target/types/soldev';
import * as borsh from '@coral-xyz/borsh';

// borsh is a wrapper of buffer-layout: https://npm.io/package/buffer-layout
// https://pabigot.github.io/buffer-layout/
const ProgramDataAccountSchema = borsh.struct([
  borsh.u64('slot'), // 4
  borsh.option(borsh.publicKey(), 'upgrade_authority_address'), // 32
]);

const Custom1AccountSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.str('value'),
  borsh.u8('slot'),
]);
const Custom2AccountSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.str('value'),
]);
const Custom3AccountSchema = borsh.struct([borsh.u8('slot')]);

describe('soldev', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet = anchor.workspace.Solsign.provider.wallet
    .payer as anchor.web3.Keypair;
  const systemProgram = anchor.web3.SystemProgram;
  const program = anchor.workspace.Soldev as Program<Soldev>;

  it('Testing cfg && program data', async () => {
    const [cfgPDA, b1] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('CfgAcc')],
      program.programId
    );
    console.log('Cfg PDA', cfgPDA.toBase58());
    await program.methods
      .checkLang(78)
      .accounts({
        acc: cfgPDA,
        user: wallet.publicKey,
        systemProgram: systemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log('Check lang done');
    try {
      const cfgInfo = await program.account.cfgAcc.fetch(cfgPDA);
      console.log('Cfg account, default way to read data: ', cfgInfo);
    } catch (err) {
      console.log('No cfg account found');
    }
    // console.log('Program ID', program.programId.toBase58());
    // const [programData, b2] = anchor.web3.PublicKey.findProgramAddressSync(
    //   [program.programId.toBytes()],
    //   new anchor.web3.PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    // );
    // console.log('Program data', programData.toBase58());
    try {
      // program.provider.connection
      //   .getAccountInfo(program.programId)
      //   .then((data) => {
      //     console.log('read : ', program.programId.toBase58());
      //     const raw = data.data;
      //     console.log('decode data: ', Buffer.from(raw).toString('hex'));
      //   });
      // TODO: fetch a custom PDA
      // program.provider.connection.getAccountInfo(programData).then((data) => {
      //   console.log('* Program Data * read : ', programData.toBase58());
      //   const buffer = data.data;
      //   console.log('got buffer: ', buffer, '; length:', buffer.length);
      //   try {
      //     const { slot, upgrade_authority_address } =
      //       ProgramDataAccountSchema.decode(buffer, 36);
      //     console.log('after buffer command');
      //     console.log(
      //       '* Program Data * decode : slot: ',
      //       slot,
      //       '; upgrade_authority_address: ',
      //       upgrade_authority_address
      //     );
      //   } catch (e) {
      //     console.log('buffer error: ', e);
      //   }
      // });

      // let's fetch cfgPDA and deserialized using CustomAccountSchema
      program.provider.connection.getAccountInfo(cfgPDA).then((data) => {
        // 213 = 8 + 4 + 200 + 1
        // 8 is the discriminator, 4 is the length of string, content up to 200, and 1 is the u8
        // Does not support multiple language!, 78 => data length: 213
        // Support multiple language!, 78 => data length: 213
        console.log('* Cfg PDA * read : ', cfgPDA.toBase58());
        console.log('data length is: ', data.data.length);
        console.log('*** Decode with Custom1AccountSchema:');
        try {
          // or decode(buffer, offset) with offset is the number of byte to read from the beginning
          const { discriminator, value, slot } = Custom1AccountSchema.decode(
            data.data
          );
          console.log(
            '* Cfg PDA1 * decode : value: "',
            value,
            '"; slot: ',
            slot,
            'discriminator: ',
            discriminator
          );
        } catch (e) {
          console.log('buffer error 1: ', e);
        }
        try {
          const { slot } = Custom3AccountSchema.decode(data.data, 8 + 4 + 26);
          console.log('* Cfg PDA3 * decode : slot: "', slot, '"');
        } catch (e) {
          console.log('buffer error 3: ', e);
        }
        try {
          const { value } = Custom2AccountSchema.decode(data.data);
          console.log(
            '* Cfg PDA2 * decode : value: "',
            value,
            '" ; len:',
            value.length,
            ''
          );
        } catch (e) {
          console.log('buffer error 2: ', e);
        }
      });
    } catch (err) {
      console.log('No program data found');
    }
  });

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log('Your transaction signature', tx);
  });
});
