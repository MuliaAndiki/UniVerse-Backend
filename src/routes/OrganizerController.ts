import { Request, Response } from "express";

class OrganizerController {
  public Say = async (req: Request, res: Response): Promise<any> => {
    try {
      res.status(200).json({
        status: 200,
        message: "Organizer Controller",
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

export default new OrganizerController();
