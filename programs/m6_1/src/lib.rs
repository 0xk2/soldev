use anchor_lang::prelude::*;

declare_id!("2kiLeviDdmqdVkxhJ6uKuZo7SAASoxrCATHmjr5mNMzr");

#[program]
pub mod m6_1 {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
      Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[account(zero_copy(unsafe))]
pub struct SomeBigDataStruct {
    pub really_big_data: [u128; 1024], // 16,384 bytes
}  

#[derive(InitSpace)]
pub struct FixedLength {
    #[max_len(200)]
    pub strl: Vec<u8>,
    #[max_len(200)]
    pub str: String,
}

#[derive(Accounts)]
pub struct SomeFunctionContext<'info> {
    #[account(zero)]
    pub some_really_big_data: AccountLoader<'info, SomeBigDataStruct>,
}
