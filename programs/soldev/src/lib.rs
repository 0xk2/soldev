use anchor_lang::prelude::*;

declare_id!("HzDUBzTLp7Zwb8WftkJvbhk67yjBS8uryvpBt1xTVdpe");

#[program]
pub mod soldev {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
