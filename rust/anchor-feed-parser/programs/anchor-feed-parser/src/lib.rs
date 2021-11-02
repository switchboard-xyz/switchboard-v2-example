#[allow(unaligned_references)]
use anchor_lang::prelude::*;
use switchboard_aggregator::get_aggregator_result_devnet;

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
        // let pid = solana_program::pubkey::Pubkey::from_str(
        //     "5n43jDh58UzjqGE2sFuZPrkgx52BT6PWgcdL1CvBU9Ww",
        // )
        // .unwrap();
        // let aggregator_account_loader =
        //     Loader::<AggregatorAccountData>::try_from(&pid, &ctx.accounts.aggregator)?;
        // let aggregator = aggregator_account_loader.load()?;
        // let round = aggregator.get_result()?;
        // let result = &round.result;
        // let final_result: f64 = result.try_into().unwrap();

        let final_result = get_aggregator_result_devnet(&ctx.accounts.aggregator)?;

        msg!("Current feed result is {}!", final_result);
        Ok(())
    }
}
