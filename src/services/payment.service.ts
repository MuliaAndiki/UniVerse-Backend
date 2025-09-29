import getMidtransClient from "../utils/midtrans";

export interface ChargeParams {
  order_id: string;
  gross_amount: number;
  customer_details?: any;
  item_details?: any[];
}

export class PaymentService {
  static async chargeVA(params: ChargeParams) {
    const core = getMidtransClient();
    const payload = {
      payment_type: "bank_transfer",
      transaction_details: {
        order_id: params.order_id,
        gross_amount: params.gross_amount,
      },
      customer_details: params.customer_details,
      item_details: params.item_details,
      bank_transfer: { bank: "bca" },
    } as any;

    const res = await core.charge(payload);
    return res;
  }

  static async chargeQRCode(params: ChargeParams) {
    const core = getMidtransClient();
    const payload = {
      payment_type: "gopay",
      transaction_details: {
        order_id: params.order_id,
        gross_amount: params.gross_amount,
      },
      gopay: {
        enable_callback: true,
        callback_url: "https://example.com/finish",
      },
    } as any;

    const res = await core.charge(payload);
    return res;
  }
}

export default PaymentService;
