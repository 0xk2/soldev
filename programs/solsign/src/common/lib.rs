use anchor_lang::{prelude::*};
use anchor_lang::solana_program::program_memory::sol_memcpy;
use anchor_lang::system_program::{CreateAccount};
use std::cmp;
use std::io::{self, Write};

///---Errors---///
#[error_code]
pub enum SolSignError {
  #[msg("Document is already published")]
  DocumentAlreadyPublished,
  #[msg("Document is not published yet")]
  DocumentNotPublished,
  #[msg("Document is anulled")]
  DocumentAnulled,
  #[msg("Signing process is finished")]
  DocumentFinished,
  #[msg("Unauthorized")]
  Unauthorized,
}

/// Helper ///
#[derive(Debug, Default)]
pub struct BpfWriter<T> {
	inner: T,
	pos: u64,
}

impl<T> BpfWriter<T> {
	pub fn new(inner: T) -> Self {
		Self { inner, pos: 0 }
	}
}

impl Write for BpfWriter<&mut [u8]> {
	fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
		if self.pos >= self.inner.len() as u64 {
			return Ok(0);
		}

		let amt = cmp::min(
			self.inner.len().saturating_sub(self.pos as usize),
			buf.len(),
		);
		sol_memcpy(&mut self.inner[(self.pos as usize)..], buf, amt);
		self.pos += amt as u64;
		Ok(amt)
	}

	fn write_all(&mut self, buf: &[u8]) -> io::Result<()> {
		if self.write(buf)? == buf.len() {
			Ok(())
		} else {
			Err(io::Error::new(
				io::ErrorKind::WriteZero,
				"failed to write whole buffer",
			))
		}
	}

	fn flush(&mut self) -> io::Result<()> {
		Ok(())
	}
}
pub fn create_account<'info>(
	system_program: AccountInfo<'info>,
	from: AccountInfo<'info>,
	to: AccountInfo<'info>,
	seeds: &[&[u8]],
	bump: u8,
	space: usize,
	owner: &Pubkey,
) -> Result<()> {
	let seeds_signer = &mut seeds.to_vec();
	let binding = [bump];
	seeds_signer.push(&binding);

	// signer seeds must equal seeds of to address
	anchor_lang::system_program::create_account(
		CpiContext::new(system_program, CreateAccount { from, to }).with_signer(&[seeds_signer]),
		Rent::get()?.minimum_balance(space),
		space.try_into().unwrap(),
		owner,
	)
}
