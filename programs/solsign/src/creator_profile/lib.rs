use anchor_lang::{prelude::*};
use crate::common::SolSignError;

#[account]
#[derive(InitSpace)]
pub struct CreatorProfile {
  pub max: u64, // 4 bytes
  pub uri: [u8; 200], // 200 bytes, uri to creator's profile
  /// To collect fee
  pub total_paid: u64, // 4 bytes
  pub to_collect: u64, // 4 bytes
  pub owner: Pubkey, // 32 bytes
}

/// Create or Edit creator account
#[derive(Accounts)]
pub struct CreateCreator<'info> {
    #[account(init, payer = user, seeds=[b"CREATOR", user.key().as_ref()], bump, space = CreatorProfile::INIT_SPACE)]
    pub creator: Account<'info, CreatorProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
pub fn run_create_creator(ctx: Context<CreateCreator>, uri: String) -> Result<()> {
  ctx.accounts.creator.uri = uri.as_bytes().try_into().unwrap();
  ctx.accounts.creator.max = 0;
  ctx.accounts.creator.total_paid = 0;
  ctx.accounts.creator.to_collect = 0;
  ctx.accounts.creator.owner = *ctx.accounts.user.key;
  Ok(())
}

#[derive(Accounts)]
pub struct MutCreator<'info> {
  #[account(mut)]
  pub creator: Account<'info, CreatorProfile>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}
pub fn run_change_creator_uri(ctx: Context<MutCreator>, uri: String) -> Result<()> {
  if ctx.accounts.creator.owner != *ctx.accounts.user.key {
    return err!(SolSignError::Unauthorized);
  }
  ctx.accounts.creator.uri = uri.as_bytes().try_into().unwrap();
  Ok(())
}
