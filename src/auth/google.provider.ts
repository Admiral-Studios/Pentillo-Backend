import { Auth, google } from 'googleapis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const GOOGLE_CLIENT = 'GOOGLE_CLIENT';

const googleFactory = async (
  configService: ConfigService,
): Promise<Auth.OAuth2Client> => {
  const googleId = configService.get('GOOGLE_AUTH_CLIENT_ID');
  const googleSecret = configService.get('GOOGLE_AUTH_CLIENT_SECRET');

  const clientUrl = configService.get('CLIENT_URL');

  return new google.auth.OAuth2(googleId, googleSecret, clientUrl);
};

export const GoogleProvider: Provider = {
  useFactory: googleFactory,
  inject: [ConfigService],
  provide: GOOGLE_CLIENT,
};
