use anchor_lang::prelude::*;

declare_id!("HzDUBzTLp7Zwb8WftkJvbhk67yjBS8uryvpBt1xTVdpe");

#[cfg(feature = "lang")]
#[constant]
pub const WELCOME_STRING:&str = "Support multiple language!";

#[cfg(not(feature = "lang"))]
#[constant]
pub const WELCOME_STRING:&str = "Does not support multiple language!";

#[account]
#[derive(InitSpace)]
pub struct CfgAcc {
	#[max_len(200)]
	pub value: String,
	pub slot: u8,
}

#[derive(Accounts)]
pub struct CfgContext<'info> {
	#[account(init, payer = user, seeds=[b"CfgAcc"], bump, space = 8 + CfgAcc::INIT_SPACE)]
	pub acc: Account<'info, CfgAcc>,
	#[account(mut)]
	pub user: Signer<'info>,
	pub system_program: Program<'info, System>
}


#[program]
pub mod soldev {
	use super::*;

	pub fn check_lang(ctx: Context<CfgContext>, slot: u8) -> Result<()> {
		ctx.accounts.acc.value = WELCOME_STRING.to_string();
		ctx.accounts.acc.slot = slot;
		Ok(())
	}

	pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
		Ok(())
	}
}

#[derive(Accounts)]
pub struct Initialize {}
