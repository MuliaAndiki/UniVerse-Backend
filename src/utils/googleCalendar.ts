import { google } from "googleapis";

export interface GoogleCalendarCreds {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export const getCalendarClient = (creds: GoogleCalendarCreds) => {
  const oauth2Client = new (google as any).auth.OAuth2(
    creds.clientId,
    creds.clientSecret,
    creds.redirectUri
  );
  if (creds.refreshToken) oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
};

export default getCalendarClient;
