import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleService {
  constructor(private configService: ConfigService) {}

  readCredentials(filePath: string): IGoogleAuthCredentials {
    const credentialsPath = path.join(filePath);
    const content: string = fs.readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(content);
  }

  getAuthClient(): OAuth2Client {
    const authClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      'postmessage',
    );

    return authClient;
  }

  async getAuthClientData(code: string): Promise<{
    email: string;
    first_name: string;
    last_name: string;
    google_id: string;
    avatar_url: string;
    refreshToken: string;
    accessToken: string;
  }> {
    const authClient = this.getAuthClient();
    console.log(authClient);
    const tokenData = await authClient.getToken(code);
    const tokens = tokenData.tokens;
    const refreshToken = tokens?.refresh_token || '';
    const accessToken = tokens?.access_token || '';

    authClient.setCredentials(tokens);

    const googleAuth = google.oauth2({
      version: 'v2',
      auth: authClient,
    } as any);

    const googleUserInfo = await googleAuth.userinfo.get();
    console.log(googleUserInfo.data);
    const {
      email,
      given_name: first_name,
      family_name: last_name,
      id: google_id,
      picture: avatar_url,
    } = googleUserInfo.data;
    return {
      email,
      first_name,
      last_name,
      google_id,
      avatar_url,
      refreshToken,
      accessToken,
    };
  }
}
export interface IGoogleAuthCredentials {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    javascript_origins: string[];
  };
}
