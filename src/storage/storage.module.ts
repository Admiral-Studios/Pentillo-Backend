import { Module } from '@nestjs/common';
import { S3Provider } from './aws-s3.provider';

import { AwsS3Service } from './services/aws-s3.service';
import { StorageController } from './storage.controller';
import { DalModule } from '../dal/dal.module';
import { StorageService } from './services/storage.service';

@Module({
  imports: [DalModule],
  providers: [S3Provider, StorageService, AwsS3Service],
  controllers: [StorageController],
  exports: [StorageService, AwsS3Service],
})
export class StorageModule {}
