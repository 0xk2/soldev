use anchor_lang::{prelude::*};
use crate::common::{SolSignError};
use crate::creator_profile::CreatorProfile;

#[account]
#[derive(InitSpace)]
pub struct Setting {
  pub fee: u64, // 4 bytes, lamport
  pub fee_collector: Pubkey, // 32 bytes
  pub owner: Pubkey, // 32 bytes
}
/// Collect fee
#[derive(Accounts)]
pub struct CollectFee<'info> {
  #[account(mut)]
  pub creator: Account<'info, CreatorProfile>,
  #[account(mut)]
  pub treasury: Account<'info, Setting>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn run_collect_fee(_ctx: Context<CollectFee>) -> Result<()> {
  // if ctx.accounts.creator.to_collect == 0 {
  //     return Ok(());
  // }
  // let to_collect = ctx.accounts.creator.to_collect;
  // ctx.accounts.creator.to_collect = 0;
  // ctx.accounts.creator.total_paid += to_collect;
  // let cpi_context = CpiContext::new(
  //     &ctx.accounts.system_program.clone(),
  //     Transfer {
  //         from: ctx.accounts.creator.clone(),
  //         to: ctx.accounts.treasury.to_account_info().clone(),
  //     }
  // );
  // transfer(cpi_context, ctx.accounts.creator.to_collect);
  // ctx.accounts.treasury.fee_collector = ctx.accounts.creator.to_account_info().key;
  // TODO: collect fee
  Ok(())
}

/// Initialize the program
#[derive(Accounts)]
pub struct InitSetting<'info> {
  #[account(init, payer = user, seeds=[b"SETTING"], bump, space = 8 + Setting::INIT_SPACE)]
  pub setting: Account<'info, Setting>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn run_initialize(ctx: Context<InitSetting>, fee: u64, fee_collector: Pubkey) -> Result<()> {
  ctx.accounts.setting.fee = fee;
  ctx.accounts.setting.fee_collector = fee_collector;
  ctx.accounts.setting.owner = *ctx.accounts.user.key;
  Ok(())
}

#[derive(Accounts)]
pub struct MutSetting<'info> {
  #[account(mut)]
  pub setting: Account<'info, Setting>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn run_change_fee(ctx: Context<MutSetting>, fee: u64) -> Result<()> {
  if ctx.accounts.setting.owner != *ctx.accounts.user.key {
    return err!(SolSignError::Unauthorized);
  }
  ctx.accounts.setting.fee = fee;
  Ok(())
}

pub fn run_change_treasury (ctx: Context<MutSetting>, treasury: Pubkey) -> Result<()> {
  if ctx.accounts.setting.owner != *ctx.accounts.user.key {
    return err!(SolSignError::Unauthorized);
  }
  ctx.accounts.setting.fee_collector = treasury;
  Ok(())
}

pub fn run_change_owner(ctx: Context<MutSetting>, new_owner: Pubkey) -> Result<()> {
  if ctx.accounts.setting.owner != *ctx.accounts.user.key {
    return err!(SolSignError::Unauthorized);
  }
  ctx.accounts.setting.owner = new_owner;
  Ok(())
}