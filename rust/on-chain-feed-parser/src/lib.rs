use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};
use std::convert::TryInto;
use switchboard_aggregator::get_aggregator_result;

entrypoint!(process_instruction);

fn process_instruction<'a>(
    _program_id: &'a Pubkey,
    accounts: &'a [AccountInfo],
    _instruction_data: &'a [u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let aggregator = next_account_info(accounts_iter)?;
    let aggregator_result = &get_aggregator_result(&aggregator)?.result;
    let final_result: f64 = aggregator_result.try_into()?;

    msg!("Current feed result is {}!", final_result);
    Ok(())
}
