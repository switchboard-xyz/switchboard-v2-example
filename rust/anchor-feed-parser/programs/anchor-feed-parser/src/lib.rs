#[allow(unaligned_references)]
use anchor_lang::prelude::*;
use std::convert::TryInto;
use switchboard_aggregator::get_aggregator_result;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[derive(Accounts)]
#[instruction(params: ReadResultParams)]
pub struct ReadResult<'info> {
    pub aggregator: AccountInfo<'info>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ReadResultParams {}

#[program]
pub mod anchor_feed_parser {
    use super::*;

    pub fn read_result(ctx: Context<ReadResult>, _params: ReadResultParams) -> ProgramResult {
        let aggregator = ctx.accounts.aggregator.as_ref();
        let aggregator_result = &get_aggregator_result(aggregator)?.result;
        let final_result: u64 = aggregator_result.try_into()?;

        msg!("Current feed result is {}!", final_result);
        Ok(())
    }
}
