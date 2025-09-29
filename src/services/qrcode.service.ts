import QRCode from "qrcode";

export class QRCodeService {
  static async generate(data: string): Promise<Buffer> {
    const buffer = await QRCode.toBuffer(data, {
      type: "png",
      errorCorrectionLevel: "H",
    });
    return buffer;
  }
}

export default QRCodeService;
