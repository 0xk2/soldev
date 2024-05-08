use anchor_lang::{prelude::*};
use crate::common::*;
use crate::document::Document;

#[account]
#[derive(InitSpace)]
pub struct Signature {
  pub signer: Pubkey, // 32 bytes
  pub doc: Pubkey, // 32 bytes
  pub status: u8 // 1 byte, 0: pending, 1: approved, 2: rejected
}

impl Signature {
  fn from<'info>(x: &'info AccountInfo<'info>) -> Account<'info, Self> {
    Account::try_from_unchecked(x).unwrap()
  }

  pub fn serialize(&self, info: AccountInfo) -> Result<()> {
    let dst: &mut [u8] = &mut info.try_borrow_mut_data().unwrap();
    let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
    Signature::try_serialize(self, &mut writer)
  }

  pub fn create(
    &mut self,
    signer: Pubkey,
    doc: Pubkey,
  ) -> Result<()> {
    self.signer = signer;
    self.doc = doc;
    self.status = 0;
    Ok(())
  }

  pub fn initialize<'info>(
    doc: AccountInfo<'info>,
    signer: Pubkey,
    signature: &'info AccountInfo<'info>,
    solsign_program: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    user: AccountInfo<'info>,
  ) -> Result<()> {
    let binding_doc = doc.key();
    let seeds: &[&[u8]] = &[b"SIGNATURE", binding_doc.as_ref(), signer.as_ref()];

    let (_, bump) = Pubkey::find_program_address(seeds, &solsign_program.key());

    create_account(
      system_program,
      user,
      signature.to_account_info(),
      &seeds,
      bump,
      8 + Signature::INIT_SPACE,
      &solsign_program.key(),
    )?;

    // deserialize and modify signature account
    let mut run = Signature::from(&signature);
    run.create(signer, doc.key())?;

    // write
    run.serialize(signature.to_account_info())?;
    Ok(())
  }
}

///---Instructions---///

/// Sign a document
#[derive(Accounts)]
pub struct SignDocument<'info> {
  pub document: Account<'info, Document>,
  #[account(mut)]
  pub signature: Account<'info, Signature>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}
pub fn run_sign_document(ctx: Context<SignDocument>, value: u8) -> Result<()> {
  // CHECK document status
  if ctx.accounts.document.status == 0 {
    return err!(SolSignError::DocumentNotActivated);
  }
  if ctx.accounts.document.status == 2 {
    return err!(SolSignError::DocumentAnulled);
  }
  // CHECK signature Status
  if ctx.accounts.signature.status != 0 {
    return err!(SolSignError::SignatureAlreadySigned);
  }
  ctx.accounts.signature.status = value;
  Ok(())
}