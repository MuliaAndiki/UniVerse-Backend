"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CampusController {
    constructor() {
        this.sayHello = async (req, res) => {
            try {
                res.status(200).json({
                    status: 200,
                    message: "Campus Controller",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
    }
}
exports.default = new CampusController();
