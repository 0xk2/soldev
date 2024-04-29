use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};
use anchor_lang::solana_program::log::sol_log_compute_units;

declare_id!("EwxLgTCGvabH6v1ELhRktRsSYbBUzMEmax9DoUzshJco");

// ----------- ACCOUNTS ----------
#[account]
pub struct Game {
    // effectively the owner/authority
    pub game_master: Pubkey,
    // the treasury to which players will send action points (using lamport)
    pub treasury: Pubkey,
    // tracks the number of action points collected by the treasury
    pub action_points_collected: u64,
    // a config struct for customizing the game
    pub game_config: GameConfig,
}

#[account]
pub struct Player {
    // the player's public key
    pub player: Pubkey,
    // the address of the corresponding game account
    pub game: Pubkey,
    // the number of action points spent
    pub action_points_spent: u64,
    // the number of action points that still need to be collected
    pub action_points_to_be_collected: u64,
    // the player's status
    pub status_flag: u8,
    // the player's experience
    pub experience: u64,
    // number of monsters killed
    pub kills: u64,
    pub next_monster_index: u64,
    // 256 bytes reserved for future use
    pub for_future_use: [u128; 2],
    // a vector of player's inventory
    pub inventory: Vec<InventoryItem>
}

#[account]
pub struct Monster {
    // the player the monster is facing
    pub player: Pubkey,
    // the game the monster is associated with
    pub game: Pubkey,
    // how many hit points the monster has left
    pub hitpoints: u64,
}

// ----------- GAME CONFIG ----------
#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct GameConfig {
    pub max_items_per_player: u8,
    // Health of Enemies?? Experience per item?? Action Points per Action??
    pub for_future_use: [u64; 16],
}

// ----------- STATUS ----------
// const IS_FROZEN_FLAG: u8 = 1 << 0;
// const IS_POISONED_FLAG: u8 = 1 << 1;
// const IS_BURNING_FLAG: u8 = 1 << 2;
// const IS_BLESSED_FLAG: u8 = 1 << 3;
// const IS_CURSED_FLAG: u8 = 1 << 4;
// const IS_STUNNED_FLAG: u8 = 1 << 5;
// const IS_SLOWED_FLAG: u8 = 1 << 6;
// const IS_BLEEDING_FLAG: u8 = 1 << 7;
const NO_EFFECT_FLAG: u8 = 0b00000000;

// ----------- INVENTORY ----------

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InventoryItem {
    pub name: [u8; 32], // Fixed Name up to 32 bytes
    pub amount: u64,
    pub for_future_use: [u8; 128], // Metadata?? // Effects // Flags?
}

// ----------- HELPER ----------
pub fn spend_action_points<'info>(
    action_points: u64,
    player_account: &mut Account<'info, Player>,
    player: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
) -> Result<()> {
    player_account.action_points_spent = player_account.action_points_spent.checked_add(action_points).unwrap();
    player_account.action_points_to_be_collected = player_account.action_points_to_be_collected.checked_add(action_points).unwrap();

    let cpi_context = CpiContext::new(
        system_program.clone(),
        Transfer {
            from: player.clone(),
            to: player_account.to_account_info().clone(),
        }
    );
    let  _ = transfer(cpi_context, action_points);
    msg!("Minus {} action points", action_points);
    Ok(())
}
// ----------- CREATE GAME ----------

#[derive(Accounts)]
pub struct CreateGame<'info>{
    #[account(
        init,
        seeds=[b"GAME", treasury.key().as_ref()],
        bump,
        payer = game_master,
        space = std::mem::size_of::<Game>() + 8,
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub game_master: Signer<'info>,

    // CHECK: Need to know they own the treasury
    pub treasury: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn run_create_game(ctx: Context<CreateGame>, max_items_per_player: u8) -> Result<()>{
   ctx.accounts.game.game_master = ctx.accounts.game_master.key().clone(); 
   ctx.accounts.game.treasury = ctx.accounts.treasury.key().clone();

   ctx.accounts.game.action_points_collected = 0;
   ctx.accounts.game.game_config.max_items_per_player = max_items_per_player;

   msg!("Game created!");

   Ok(())
}

// ----------- CREATE PLAYER ----------
#[derive(Accounts)]
pub struct CreatePlayer<'info>{
    pub game: Box<Account<'info, Game>>,
    #[account(
        init,
        seeds=[
            b"PLAYER",
            game.key().as_ref(),
        ],
        bump,
        payer = player,
        space = std::mem::size_of::<Player>() + std::mem::size_of::<InventoryItem>() * game.game_config.max_items_per_player as usize + 8,
    )]
    pub player_account: Account<'info, Player>,
    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn run_create_player(ctx: Context<CreatePlayer>) -> Result<()> {
    ctx.accounts.player_account.player = ctx.accounts.player.key().clone();
    ctx.accounts.player_account.game = ctx.accounts.game.key().clone();

    ctx.accounts.player_account.status_flag = NO_EFFECT_FLAG;
    ctx.accounts.player_account.experience = 0;
    ctx.accounts.player_account.kills = 0;

    msg!("Hero has entered the game!");
    { // Spend 100 lamports to create player
        let action_points_to_spend = 100;

        spend_action_points(
            action_points_to_spend, 
            &mut ctx.accounts.player_account,
            &ctx.accounts.player.to_account_info(),
            &ctx.accounts.system_program.to_account_info()
        )?;
    }
    Ok(())
}

// ----------- SPAWN MONSTER ----------
#[derive(Accounts)]
pub struct SpawnMonster<'info>{
    pub game: Box<Account<'info, Game>>,
    #[account(mut, 
        has_one = game, 
        has_one = player,
    )]
    pub player_account: Box<Account<'info, Player>>,
    #[account(
        init,
        seeds=[
            b"MONSTER",
            game.key().as_ref(),
            player.key().as_ref(),
            player_account.next_monster_index.to_le_bytes().as_ref(),
        ],
        bump,
        payer = player,
        space = std::mem::size_of::<Monster>() + 8,
    )]
    pub monster: Account<'info, Monster>,
    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}
pub fn run_spawn_monster(ctx: Context<SpawnMonster>) -> Result<()> {
    {
        ctx.accounts.monster.player = ctx.accounts.player.key().clone();
        ctx.accounts.monster.game = ctx.accounts.game.key().clone();
        ctx.accounts.monster.hitpoints = 100;

        msg!("Monster Spawned!");
    }

    {
        ctx.accounts.player_account.next_monster_index += ctx.accounts.player_account.next_monster_index.checked_add(1).unwrap();
    }

    { // Spend 5 lamports to spawn monster
        let action_points_to_spend = 5;
        spend_action_points(
            action_points_to_spend, 
            &mut ctx.accounts.player_account, 
            &ctx.accounts.player.to_account_info(),
            &ctx.accounts.system_program.to_account_info()
        )?;
    }

    Ok(())
}
// ----------- ATTACK MONSTER ----------
#[derive(Accounts)]
pub struct AttackMonster<'info> {
    #[account(mut,
        has_one = player
    )]
    pub player_account: Box<Account<'info, Player>>,
    #[account(mut,
        has_one = player,
        constraint = monster.game == player_account.game
    )]
    pub monster: Box<Account<'info, Monster>>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn run_attach_monster(ctx: Context<AttackMonster>) -> Result<()> {
    let mut did_kill = false;
    {
        let hp_before_attack = ctx.accounts.monster.hitpoints;
        let hp_after_attack = ctx.accounts.monster.hitpoints.saturating_sub(1);
        let damage_dealt = hp_before_attack - hp_after_attack;
        ctx.accounts.monster.hitpoints = hp_after_attack;

        if hp_before_attack > 0 && hp_after_attack == 0 {
            did_kill = true;
        }

        if damage_dealt > 0 {
            msg!("Damage Dealt: {}", damage_dealt);
        } else {
            msg!("Stop it's already dead");
        }
    }

    {
        ctx.accounts.player_account.experience = ctx.accounts.player_account.experience.saturating_add(1);
        msg!("+1 EXP");

        if did_kill {
            ctx.accounts.player_account.kills = ctx.accounts.player_account.kills.saturating_add(1);
            msg!("You killed the monster!");
        }
    }

    { // Spend 1 lampoarts to attach monster
        let action_points_to_spend = 1;
        spend_action_points(
            action_points_to_spend, 
            &mut ctx.accounts.player_account, 
            &ctx.accounts.player.to_account_info(),
            &ctx.accounts.system_program.to_account_info()
        )?;
    }

    Ok(())
}
// ----------- REDEEM TO TREASURY ----------
#[derive(Accounts)]
pub struct CollectActionPoints<'info> {
    #[account(
        mut,
        has_one=treasury
    )]
    pub game: Box<Account<'info, Game>>,
    #[account(
        mut,
        has_one=game
    )]
    pub player: Box<Account<'info, Player>>,

    #[account(mut)]
    /// CHECK: It's being checked in the game account
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn run_collect_action_points(ctx: Context<CollectActionPoints>) -> Result<()> {
    let transfer_amount: u64 = ctx.accounts.player.action_points_to_be_collected;

    **ctx.accounts.player.to_account_info().try_borrow_mut_lamports()? -= transfer_amount;
    **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += transfer_amount;

    ctx.accounts.player.action_points_to_be_collected = 0;
    ctx.accounts.game.action_points_collected = ctx.accounts.game.action_points_collected.checked_add(transfer_amount).unwrap();

    msg!("The treasury has collected {} action points", transfer_amount);

    Ok(())
}

#[program]
pub mod rpg {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>,
        max_items_per_player: u8) -> Result<()> {
        run_create_game(ctx, max_items_per_player)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn create_player(ctx: Context<CreatePlayer>) -> Result<()> {
        run_create_player(ctx)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn attack_monster(ctx: Context<AttackMonster>) -> Result<()> {
        run_attach_monster(ctx)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn deposit_action_points(ctx: Context<CollectActionPoints>) -> Result<()> {
        run_collect_action_points(ctx)?;
        sol_log_compute_units();
        Ok(())
    }
}

