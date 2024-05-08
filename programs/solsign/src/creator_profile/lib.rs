use anchor_lang::{prelude::*};
use crate::common::SolSignError;

#[account]
#[derive(InitSpace)]
pub struct CreatorProfile {
  pub max: u64, // 4 bytes
  /// To collect fee
  pub total_paid: u64, // 4 bytes
  pub to_collect: u64, // 4 bytes
  pub owner: Pubkey, // 32 bytes
  #[max_len(200)]
  pub uri: String, // 200 bytes, uri to creator's profile
}

/// Create or Edit creator account
#[derive(Accounts)]
pub struct CreateCreator<'info> {
    #[account(init, payer = user, seeds=[b"CREATOR", user.key().as_ref()], bump, space = 8 + CreatorProfile::INIT_SPACE)]
    pub profile: Account<'info, CreatorProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
pub fn run_create_creator(ctx: Context<CreateCreator>, uri: String) -> Result<()> {
  ctx.accounts.profile.uri = uri;
  ctx.accounts.profile.max = 0;
  ctx.accounts.profile.total_paid = 0;
  ctx.accounts.profile.to_collect = 0;
  ctx.accounts.profile.owner = *ctx.accounts.user.key;
  Ok(())
}

#[derive(Accounts)]
pub struct MutCreator<'info> {
  #[account(mut)]
  pub profile: Account<'info, CreatorProfile>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}
pub fn run_change_creator_uri(ctx: Context<MutCreator>, uri: String) -> Result<()> {
  if ctx.accounts.profile.owner != *ctx.accounts.user.key {
    return err!(SolSignError::Unauthorized);
  }
  ctx.accounts.profile.uri = uri;
  Ok(())
}
