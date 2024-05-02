import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  Patch,
  UseInterceptors,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import * as Prisma from '@prisma/client';
import { Response } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';

import { StorageService } from './services/storage.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { User } from '../user/user.decorator';
import {
  SWAGGER_FILES_SCHEMA,
  SWAGGER_FILE_SCHEMA,
  SWAGGER_UPDATE_FILES_SCHEMA,
} from './storage.constants';
import { AvatarMimeTypeValidationPipe } from './pipes/avatar-mime-type-validation.pipe';
import { FileResponseDto } from './dto/response-dto/file-response.dto';
import { FileUploadDto } from './dto/request-dto/file-upload.dto';
import { FileIdsDto } from './dto/request-dto/file-ids.dto';
import { UpdateFileDto } from './dto/request-dto/update-file.dto';
import { IsFileExistGuard } from './guards/is-file-exist.guard';
import { FilesSizeValidationPipe } from './pipes/files-size-validation.pipe';
import { FilesMimeTypeValidationPipe } from './pipes/files-mime-type-validation.pipe';
import { ParamsIdsDto } from '../common/dto/params-ids.dto';
import { IsListExistGuard } from '../list/guards/is-list-exist.guard';
import { IsTypeListDocumentsGuard } from './guards/is-type-list-documents.guard';
import { GetFilesFilterDto } from './dto/request-dto/search-file-list.dto';

@ApiTags('storage')
@Controller('storage')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({ summary: 'search file list' })
  @Get()
  public getDatesList(
    @Query() dto: GetFilesFilterDto,
  ): Promise<FileResponseDto[]> {
    return this.storageService.getFilesByFilter(dto);
  }

  @ApiOperation({ summary: 'download all list files' })
  @UseGuards(IsListExistGuard, IsTypeListDocumentsGuard)
  @Get('download/list/:listId')
  public async download(
    @Param('listId') listId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.storageService.downloadListFiles(listId, res);
  }

  @ApiOperation({ summary: 'download files by ids' })
  @ApiParam({ name: 'listId' })
  @UseGuards(IsListExistGuard, IsTypeListDocumentsGuard)
  @Get('download/files/list/:listId/zip')
  public async downloadFilesByIds(
    @Res() res: Response,
    @Query() dto: FileIdsDto,
  ): Promise<void> {
    await this.storageService.downloadFilesByIds(dto.fileIds, res);
  }

  @ApiOperation({ summary: 'upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(SWAGGER_FILE_SCHEMA)
  @Post('user/avatar')
  @UseInterceptors(FileInterceptor('file'))
  public uploadAvatarToSystem(
    @UploadedFile(AvatarMimeTypeValidationPipe, FilesSizeValidationPipe)
    file: Express.Multer.File,
    @User() user: Prisma.User,
  ): Promise<string> {
    return this.storageService.uploadUserAvatarToS3(file, user);
  }

  @ApiOperation({ summary: 'upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(SWAGGER_FILES_SCHEMA)
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  public uploadFilesToSystem(
    @UploadedFile(FilesMimeTypeValidationPipe, FilesSizeValidationPipe)
    file: Express.Multer.File,
    @Body() body: FileUploadDto,
    @User('id') userId: string,
  ): Promise<FileResponseDto> {
    return this.storageService.uploadFile(file, body, userId);
  }

  @ApiOperation({ summary: 'update file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(SWAGGER_UPDATE_FILES_SCHEMA)
  @UseGuards(IsFileExistGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('update-file/:fileId')
  public updateFile(
    @Param('fileId') fileId: string,
    @Body() dto: UpdateFileDto,
    @User('id') userId: string,
    @UploadedFile(FilesMimeTypeValidationPipe, FilesSizeValidationPipe)
    file?: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.storageService.updateFile(fileId, dto, userId, file);
  }

  @ApiOperation({ summary: 'delete files' })
  @Delete('delete-files')
  public deleteFiles(@Query() dto: ParamsIdsDto): Promise<void> {
    return this.storageService.deleteFiles(dto.ids);
  }
}
