import { BadRequestException, Injectable } from '@nestjs/common';
import { File, TypeList, User } from '@prisma/client';
import * as sharp from 'sharp';
import { getAwsKey } from '../../common/helpers/helpers';

import { AwsS3Service } from './aws-s3.service';
import { EntityManager } from '../../dal/entity-manager';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from '../dto/response-dto/file-response.dto';
import { FileDetailsToSaveTransform } from '../../dal/file/transformations/file-details-to-save.transform';
import { Response } from 'express';
import * as archiver from 'archiver';
import { UpdateFileDto } from '../dto/request-dto/update-file.dto';
import { FileUploadDto } from '../dto/request-dto/file-upload.dto';
import { GetFilesFilterDto } from '../dto/request-dto/search-file-list.dto';

@Injectable()
export class StorageService {
  private fileInfo: string;
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly entityManager: EntityManager,
  ) {}

  public async uploadUserAvatarToS3(
    file: Express.Multer.File,
    user: User,
  ): Promise<string> {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const key = getAwsKey(user?.avatar);

    const url = await this.awsS3Service.uploadFileToS3(
      `usr-${user.id}`,
      file,
      key,
    );

    await this.entityManager.userRepository.updateUser(user.id, {
      avatar: url,
    });

    return url;
  }

  public async uploadFile(
    file: Express.Multer.File,
    dto: FileUploadDto,
    userId: string,
  ): Promise<FileResponseDto> {
    const list = await this.entityManager.listRepository.getListById(
      dto.listId,
    );

    if (list.type !== TypeList.DOCUMENTS) {
      throw new BadRequestException('List for documents only');
    }

    if (dto?.name) {
      file.originalname = dto.name;
    }

    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    if (file.mimetype.startsWith('image')) {
      file.buffer = await sharp(file.buffer)
        .withMetadata()
        .webp({ effort: 3 })
        .jpeg()
        .toBuffer();
    }

    if (list?.transactionId) {
      this.fileInfo = await this.awsS3Service.uploadFileToS3(
        `usr-${userId}/trans-${list.transactionId}/list-${list.id}`,
        file,
      );
    } else if (list?.templateId) {
      this.fileInfo = await this.awsS3Service.uploadFileToS3(
        `usr-${userId}/template-${list.templateId}/list-${list.id}`,
        file,
      );
    } else {
      this.fileInfo = await this.awsS3Service.uploadFileToS3(
        `usr-${userId}`,
        file,
      );
    }

    const transformFileToSave = plainToInstance(FileDetailsToSaveTransform, {
      ...file,
      fileInfo: this.fileInfo,
      userId,
      ...dto,
    });

    const systemFile =
      await this.entityManager.fileRepository.createFile(transformFileToSave);

    return plainToInstance(FileResponseDto, systemFile);
  }

  public async deleteFiles(ids: string[]): Promise<void> {
    try {
      const files = await this.entityManager.fileRepository.getFilesByIds(ids);

      const fileKeys = files.reduce((acc, file) => {
        if (!file.isCopyFile) {
          acc.push({ Key: file.key });
        }
        return acc;
      }, []);

      await Promise.all([
        this.awsS3Service.deleteFileByKey(fileKeys),
        this.entityManager.fileRepository.deleteFiles(ids),
      ]);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Something went wrong');
    }
  }

  public async updateFile(
    id: string,
    dto: UpdateFileDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<FileResponseDto> {
    if (!file) {
      const updateFile = await this.entityManager.fileRepository.updateFile(
        id,
        userId,
        dto,
      );

      return plainToInstance(FileResponseDto, updateFile);
    }

    const [uploadNewFile, oldFile] = await Promise.all([
      this.uploadFile(file, dto, userId),
      this.entityManager.fileRepository.getFileById(id),
    ]);

    if (!dto.name) {
      await this.entityManager.fileRepository.updateFile(
        uploadNewFile.id,
        userId,
        {
          name: oldFile.name,
          listId: dto.listId,
          notes: oldFile.notes,
        },
      );
    }

    const [newFile] = await Promise.all([
      this.entityManager.fileRepository.getFileById(uploadNewFile.id),
      this.deleteFiles([oldFile.id]),
    ]);

    return plainToInstance(FileResponseDto, newFile);
  }

  public async downloadListFiles(listId: string, res: Response): Promise<void> {
    const files = await this.entityManager.fileRepository.getFileListByFilter({
      listId,
    });

    return this.composeZipFile(files, res);
  }

  public async downloadFilesByIds(ids: string[], res: Response): Promise<void> {
    const files = await this.entityManager.fileRepository.getFilesByIds(ids);

    return this.composeZipFile(files, res);
  }

  public async getFilesByFilter(
    dto: GetFilesFilterDto,
  ): Promise<FileResponseDto[]> {
    const files =
      await this.entityManager.fileRepository.getFileListByFilter(dto);

    return plainToInstance(FileResponseDto, files);
  }

  private async composeZipFile(files: File[], res: Response): Promise<void> {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=files.zip`);

    const archive = archiver('zip');
    archive.pipe(res);

    await Promise.all(
      files.map(async (file) => {
        const fileData = await this.awsS3Service.getObject(file.key);

        archive.append(fileData, { name: file.name });
      }),
    );

    archive.finalize();
  }
}
