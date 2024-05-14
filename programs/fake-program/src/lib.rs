use anchor_lang::prelude::*;

declare_id!("3587AJrnBE5N6AgicmvC5ZrMt3a511jN2Ai4Nu78RXs9");

#[program]
pub mod fake_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
