pub mod common;
pub mod setting;
pub mod creator_profile;
pub mod document;
pub mod signature;

use anchor_lang::{prelude::*};
use setting::*;
use creator_profile::*;
use document::*;
use signature::*;

declare_id!("EeLs6B1EFQSGaivXCgQj9J2M9eDGBzaaCicFomxZgpAK");

#[program]
pub mod solsign {

	use super::*;

	pub fn initialize(ctx: Context<InitSetting>, fee: u64, fee_collector: Pubkey) -> Result<()> {
		run_initialize(ctx, fee, fee_collector)?;
		Ok(())
	}

	pub fn change_fee(ctx: Context<MutSetting>, fee: u64) -> Result<()> {
			run_change_fee(ctx, fee)?;
			Ok(())
	}

	pub fn change_treasury (ctx: Context<MutSetting>, treasury: Pubkey) -> Result<()> {
		run_change_treasury(ctx, treasury)?;
		Ok(())
	}

	pub fn change_owner (ctx: Context<MutSetting>, owner: Pubkey) -> Result<()> {
		run_change_owner(ctx, owner)?;
		Ok(())
	}

	pub fn create_creator(ctx: Context<CreateCreator>, uri: String) -> Result<()> {
		run_create_creator(ctx, uri)?;
		Ok(())
	}

	pub fn change_creator_uri(ctx: Context<MutCreator>, uri: String) -> Result<()> {
		run_change_creator_uri(ctx, uri)?;
		Ok(())
	}

	pub fn create_document<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, CreateDocument<'info>>, uri: String, signers: Vec<Pubkey>) -> Result<()> {
		run_create_document(ctx, uri, signers)?;
		Ok(())
	}

	pub fn edit_document_uri(ctx: Context<MutDocument>, uri: String) -> Result<()> {
		run_edit_document_uri(ctx, uri)?;
		Ok(())
	}

	pub fn anull_document(ctx: Context<MutDocument>) -> Result<()> {
		run_anull_document(ctx)?;
		Ok(())
	}

	pub fn activate_document(ctx: Context<MutDocument>) -> Result<()> {
		run_activate_document(ctx)?;
		Ok(())
	}

	pub fn sign_document(ctx: Context<SignDocument>, value: u8) -> Result<()> {
		run_sign_document(ctx, value)?;
		Ok(())
	}

	pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
		run_collect_fee(ctx)?;
		Ok(())
	}
}