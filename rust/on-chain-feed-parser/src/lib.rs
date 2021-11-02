pub use anchor_lang::prelude::*;
pub use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
};
pub use switchboard_aggregator::get_aggregator_result_devnet;

entrypoint!(process_instruction);

fn process_instruction<'a>(
    _program_id: &'a Pubkey,
    accounts: &'a [AccountInfo],
    _instruction_data: &'a [u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let aggregator = next_account_info(accounts_iter)?;

    let final_result = get_aggregator_result_devnet(aggregator)?;

    msg!("Current feed result is {}!", final_result);
    Ok(())
}
