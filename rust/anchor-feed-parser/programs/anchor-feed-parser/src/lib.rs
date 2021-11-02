#[allow(unaligned_references)]
use anchor_lang::prelude::*;
use std::convert::TryInto;
use std::str::FromStr;
use switchboard_aggregator::structs::{AggregatorAccountData, AggregatorRound, SwitchboardDecimal};

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
        msg!("{}", std::mem::size_of::<AggregatorAccountData>());
        msg!("a");
        let buf = ctx.accounts.aggregator.try_borrow_data()?;
        // let aggregator = AggregatorAccountData::new(&ctx.accounts.aggregator)?;
        // let aggregator: &AggregatorAccountData = bytemuck::from_bytes(&buf[8..]);
        let pid = solana_program::pubkey::Pubkey::from_str("5n43jDh58UzjqGE2sFuZPrkgx52BT6PWgcdL1CvBU9Ww").unwrap();
        let aggregator_account_loader =
            Loader::<AggregatorAccountData>::try_from(&pid, &ctx.accounts.aggregator)?;
        let aggregator: AggregatorAccountData = *aggregator_account_loader.load()?;
        // msg!("a");
        // aggregator.get_result()
        // let final_result: u64 = aggregator_result.try_into()?;
//
        // msg!("Current feed result is {}!", final_result);
        Ok(())
    }
}
