import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesSizeValidationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(
    values: Express.Multer.File,
  ): Express.Multer.File | Express.Multer.File[] {
    const maxFileSize = this.configService.get('MAX_FILE_SIZE');

    if (!values) return;

    if (Array.isArray(values)) {
      const filterInvalid = values.filter(({ size }) => size > maxFileSize);

      if (filterInvalid.length) {
        throw new BadRequestException(
          filterInvalid.map(({ originalname }) => `${originalname} big file`),
        );
      }
    } else {
      if (values?.size > maxFileSize) {
        throw new BadRequestException(`${values.originalname} big file`);
      }
    }

    return values;
  }
}
