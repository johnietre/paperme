// A user account.
// All monetary accounts (e.g., cash and equity) as stored in USD and with 4
// significant digits (e.g., $123,412.32 => 1234123200).
interface Account {
	// Account id (generated by server)
	id: string;
	email: string;
	phone: string;
	first_name: string;
	middle_names: string[];
	last_name: string;
	// Cash held by the user
	// Buying power (for the time being; no margin)
	cash: number;
	// Total equity of the user
	equity: number;
	// When the account was created
}
