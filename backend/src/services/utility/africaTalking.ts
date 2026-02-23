import AfricasTalking from "africastalking";
import { AirtimeProvider } from ".";

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
});

export class AfricaTalkingProvider implements AirtimeProvider {
  async sendAirtime(phone: string, amount: number) {
    try {
      const res = await at.AIRTIME.send({
        recipients: [
          {
            phoneNumber: phone,
            amount: `GHS ${amount}`,
          },
        ],
      });

      const r = res.responses?.[0];

      if (r?.status === "Success") {
        return {
          success: true,
          reference: r.requestId,
        };
      }

      return {
        success: false,
        error: r?.errorMessage,
      };
    } catch (err: any) {
      console.error("AT AIRTIME ERROR:", err);
      return { success: false, error: err.message };
    }
  }
}