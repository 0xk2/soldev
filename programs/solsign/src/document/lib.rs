use anchor_lang::{prelude::*};

use crate::common::*;
use crate::creator_profile::CreatorProfile;
use crate::signature::Signature;

#[account]
#[derive(InitSpace)]
pub struct Document {
    pub status: u8, // 1 byte, 0: pending, 1: activated, 2: anulled
    #[max_len(10)]
    pub signers: Vec<Pubkey>, // 32 bytes * 10
    #[max_len(200)]
    pub uri: String, // 200 bytes, uri to doc
}

/// Create a document
#[derive(Accounts)]
pub struct CreateDocument<'info> {
  #[account(
    init, 
    payer = user, 
    seeds=[b"DOCUMENT", user.key().as_ref(), profile.max.to_le_bytes().as_ref()], 
    bump, 
    space = 8 + Document::INIT_SPACE
  )]
  pub document: Account<'info, Document>,
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(mut)]
  pub profile: Account<'info, CreatorProfile>,
  /// CHECK:
  pub solsign_program: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
}
pub fn run_create_document<'c: 'info, 'info>(
  ctx: Context<'_, '_, 'c, 'info, CreateDocument<'info>>, 
  uri: String, signers: Vec<Pubkey>
) -> Result<()> {
  if signers.len() > 10 {
    return err!(SolSignError::TooManySigners);
  }
  // TODO: no duplicate signers
  ctx.accounts.document.uri = uri;
  ctx.accounts.document.status = 0;
  for s in signers.iter() {
    ctx.accounts.document.signers.push(*s);
  }

  let remaining_accounts_iter = &mut ctx.remaining_accounts.iter();
  for signer in signers.iter() {
    Signature::initialize(
      ctx.accounts.document.to_account_info(), 
      *signer, 
      next_account_info(remaining_accounts_iter)?, 
      ctx.accounts.solsign_program.to_account_info(), 
      ctx.accounts.system_program.to_account_info(), 
      ctx.accounts.user.to_account_info()
    )?;
  }
  ctx.accounts.profile.max += 1;
  // TODO: send some sol to the Creator account
  Ok(())
}
#[derive(Accounts)]
pub struct MutDocument<'info> {
  #[account(mut)]
  pub document: Account<'info, Document>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}
/// Cannot edit a document if it is already actived
pub fn run_edit_document_uri(ctx: Context<MutDocument>, uri: String) -> Result<()> {
  if ctx.accounts.document.status != 0 {
    return err!(SolSignError::DocumentAlreadyActivated);
  }
  ctx.accounts.document.uri = uri;
  Ok(())
}

/// Publish a document
pub fn run_activate_document(ctx: Context<MutDocument>) -> Result<()> {
  if ctx.accounts.document.status != 0 {
    return err!(SolSignError::DocumentNotAbleAcitvate);
  }
  ctx.accounts.document.status = 1;
  // TODO: delete signature accounts
  Ok(())
}

/// Cannot anull a document if it is finished or already anulled
pub fn run_anull_document(ctx: Context<MutDocument>) -> Result<()> {
  if ctx.accounts.document.status == 2 {
    return err!(SolSignError::DocumentAnulled);
  }
  ctx.accounts.document.status = 2;
  // TODO: delete signature accounts
  Ok(())
}