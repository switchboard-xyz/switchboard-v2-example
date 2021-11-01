use anchor_lang::prelude::*;
use std::convert::TryInto;
use switchboard_aggregator::get_aggregator_result;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[derive(Accounts)]
#[instruction()] // rpc parameters hint
pub struct ReadResult<'info> {
    #[account(mut)]
    pub result: Loader<'info, LastResult>,
    pub aggregator: AccountInfo<'info>,
}

#[program]
pub mod on_chain_parser {
    use super::*;
    pub fn read_result(ctx: Context<ReadResult>) -> ProgramResult {
        let mut result_state = ctx.accounts.result.load_mut()?;

        let aggregator = ctx.accounts.aggregator.as_ref();
        let aggregator_result = &get_aggregator_result(aggregator)?.result;
        let final_result: f64 = aggregator_result.try_into()?;

        result_state.result = final_result;
        result_state.aggregator_pubkey = *aggregator.key;
        msg!("Current feed result is {}!", final_result);
        Ok(())
    }
}

#[account(zero_copy)]
pub struct LastResult {
    aggregator_pubkey: Pubkey,
    result: f64,
}
