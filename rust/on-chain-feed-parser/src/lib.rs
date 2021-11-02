pub use anchor_lang::prelude::*;
pub use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
};
use std::convert::TryInto;
pub use switchboard_aggregator::get_aggregator_result_devnet;
pub use switchboard_aggregator::structs::SwitchboardDecimal;

entrypoint!(process_instruction);

fn process_instruction<'a>(
    _program_id: &'a Pubkey,
    accounts: &'a [AccountInfo],
    _instruction_data: &'a [u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let aggregator = next_account_info(accounts_iter)?;

    let result: SwitchboardDecimal = get_aggregator_result_devnet(aggregator)?;
    let decimal: f64 = (&result).try_into().unwrap();

    msg!("Current feed result is {}!", decimal);
    Ok(())
}
