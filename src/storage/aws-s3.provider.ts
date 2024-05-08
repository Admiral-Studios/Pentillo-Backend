import { S3Client } from '@aws-sdk/client-s3';

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3_CLIENT } from './storage.constants';

const S3Factory = async (configService: ConfigService): Promise<S3Client> => {
  const accessKeyId = configService.get<string>('S3_ACCESSKEYID');
  const secretAccessKey = configService.get<string>('S3_SECRETACCESSKEY');
  const region = configService.get<string>('S3_REGION');

  const credentials = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  };

  return new S3Client({ credentials, region });
};

export const S3Provider: Provider = {
  useFactory: S3Factory,
  inject: [ConfigService],
  provide: S3_CLIENT,
};
