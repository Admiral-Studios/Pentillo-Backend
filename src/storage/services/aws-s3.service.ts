import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import { S3_CLIENT } from '../storage.constants';
import { buildKeyName } from '../../common/helpers/helpers';
import { Readable } from 'stream';

@Injectable()
export class AwsS3Service {
  private readonly bucketName: string;
  private readonly s3Url: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get('S3_BUCKET_NAME');
    this.s3Url = this.configService.get('S3_URL');
  }

  public async uploadFileToS3(
    rootFolder: string,
    file: Express.Multer.File,
    key?: string,
  ): Promise<string> {
    const fileName = buildKeyName(rootFolder, file);

    if (key) await this.deleteFileByKey([{ Key: key }]);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: file.mimetype,
        Body: file.buffer,
      }),
    );

    return `https://${this.bucketName}.${this.s3Url}/${fileName}`;
  }

  public async deleteFileByKey(
    objectsToDelete: { Key: string }[],
  ): Promise<void> {
    if (!objectsToDelete.length) return;

    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: { Objects: objectsToDelete },
      }),
    );
  }

  public async getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3.send(command);
    const stream = response?.Body as Readable;
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
