export interface User {
  id: string;
  email: string;
  wallet_addresses?: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  otp_verified_at?: string;
}
