import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as mime from 'mime-types';

@Injectable()
export class AvatarMimeTypeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      throw new BadRequestException(`Unsupported file format`);
    }

    const mimetype = mime.lookup(value.originalname);

    if (!mimetype.startsWith('image'))
      throw new BadRequestException(
        `${value.originalname} unsupported file format`,
      );

    return value;
  }
}
