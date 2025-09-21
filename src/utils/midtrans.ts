import midtransClient from "midtrans-client";
import { env } from "../utils/env.config";

let core: midtransClient.CoreApi | null = null;

export const getMidtransClient = () => {
  if (!core) {
    core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY as string,
      clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
    });
  }
  return core!;
};

export default getMidtransClient;
