#[allow(unaligned_references)]
use anchor_lang::prelude::*;
use std::convert::TryInto;
use switchboard_aggregator::get_aggregator_result;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[derive(Accounts)]
#[instruction()]
pub struct ReadResult<'info> {
    // #[account(mut)]
    // pub result: Loader<'info, LastResult>,
    pub aggregator: AccountInfo<'info>,
}

// #[derive(Accounts)]
// pub struct InitResult<'info> {
//     #[account(zero)]
//     pub result: Loader<'info, LastResult>,
// }

#[program]
pub mod anchor_feed_parser {
    use super::*;

    // pub fn initialize(ctx: Context<InitResult>) -> ProgramResult {
    //     ctx.accounts.result.load_init()?;
    //     msg!("Result account initialized!");
    //     Ok(())
    // }

    pub fn read_result(ctx: Context<ReadResult>) -> ProgramResult {
        // let mut result_state = ctx.accounts.result.load_mut()?;

        let aggregator = ctx.accounts.aggregator.as_ref();
        let aggregator_result = &get_aggregator_result(aggregator)?.result;
        let final_result: u64 = aggregator_result.try_into()?;

        // result_state.result = final_result;
        // result_state.aggregator_pubkey = *aggregator.key;
        // result_state.timestamp = Clock::get()?.unix_timestamp;
        msg!("Current feed result is {}!", final_result);
        Ok(())
    }
}

// #[account(zero_copy)]
// #[derive(AnchorDeserialize, AnchorSerialize, Debug, Default)]
// pub struct LastResult {
//     aggregator_pubkey: Pubkey,
//     result: u64,
//     timestamp: i64,
// }
