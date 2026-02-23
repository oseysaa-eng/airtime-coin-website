export interface AirtimeResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export interface AirtimeProvider {
  sendAirtime(
    phone: string,
    amount: number
  ): Promise<AirtimeResult>;
}