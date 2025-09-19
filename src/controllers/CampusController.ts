import { Request, Response } from "express";

class CampusController {
  public sayHello = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        status: 200,
        message: "Campus Controller",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}

export default new CampusController();
