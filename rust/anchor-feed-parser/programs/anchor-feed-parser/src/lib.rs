#[allow(unaligned_references)]
use anchor_lang::prelude::*;
use std::convert::TryInto;
pub use switchboard_aggregator::{get_aggregator_result, SwitchboardDecimal};

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
        let result: SwitchboardDecimal = get_aggregator_result(&ctx.accounts.aggregator)?;
        let decimal: f64 = (&result).try_into().unwrap();

        msg!("Current feed result is {}!", decimal);
        Ok(())
    }
}
