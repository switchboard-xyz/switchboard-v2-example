use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use switchboard_aggregator::get_aggregator_result;

entrypoint!(process_instruction);

fn process_instruction<'a>(
    _program_id: &'a Pubkey,
    accounts: &'a [AccountInfo],
    _instruction_data: &'a [u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let switchboard_feed_account = next_account_info(accounts_iter)?;

    msg!("Current feed result is !");
    Ok(())
}
