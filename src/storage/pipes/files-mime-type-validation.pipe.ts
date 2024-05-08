import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesMimeTypeValidationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: Express.Multer.File): Express.Multer.File {
    const allowedTypes = this.configService.get('ALLOWED_MIMETYPES');

    if (!value) return;

    if (!allowedTypes.includes(value.mimetype)) {
      throw new BadRequestException(
        `${value.originalname} has an unsupported file format`,
      );
    }

    return value;
  }
}
