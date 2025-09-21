"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarClient = void 0;
const googleapis_1 = require("googleapis");
const getCalendarClient = (creds) => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(creds.clientId, creds.clientSecret, creds.redirectUri);
    if (creds.refreshToken)
        oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
    return googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
};
exports.getCalendarClient = getCalendarClient;
exports.default = exports.getCalendarClient;
