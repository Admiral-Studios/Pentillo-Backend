import {
  Body,
  Controller,
  UseGuards,
  Post,
  Delete,
  Query,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { User } from '../user/user.decorator';

import { CreateTemplateDto } from './dto/request-dto/create-template.dto';
import { TemplateService } from './template.service';
import { TemplateResponseDto } from './dto/response-dto/response-template.dto';
import { ParamsIdsDto } from '../common/dto/params-ids.dto';
import { GetTemplateList } from './dto/request-dto/get-template-list.dto';
import { TemplateListResponse } from './dto/response-dto/response-template-list.dto';
import { UpdateTemplateDto } from './dto/request-dto/update-template.dto';
import { IsTemplateExistGuard } from './guards/is-template-exist.guard';
import { UserDto } from 'src/user/dto/response-dto/user.dto';
import { SearchFilterDto } from '../common/dto/search-filter.dto';

@ApiTags('template')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiOperation({ summary: 'get template list' })
  @Get()
  public getTemplateList(
    @User() user: UserDto,
    @Query() filter: GetTemplateList,
  ): Promise<TemplateListResponse> {
    return this.templateService.getTemplateList(user.member.teamId, filter);
  }

  @ApiOperation({ summary: 'search template names' })
  @Get('/search-name')
  public getTemplateNames(
    @User() user: UserDto,
    @Query() filter: SearchFilterDto,
  ): Promise<string[]> {
    return this.templateService.getTemplateNames(user.member.teamId, filter);
  }

  @ApiOperation({ summary: 'get template by id' })
  @UseGuards(IsTemplateExistGuard)
  @Get(':id')
  public getTemplate(@Param('id') id: string): Promise<TemplateResponseDto> {
    return this.templateService.getTemplateById(id);
  }

  @ApiOperation({ summary: 'duplicate template by id' })
  @UseGuards(IsTemplateExistGuard)
  @Post('/duplicate/:id')
  public duplicateTemplate(
    @User() user: UserDto,
    @Param('id') id: string,
  ): Promise<TemplateResponseDto> {
    return this.templateService.duplicateTemplate(
      id,
      user.id,
      user.member.teamId,
    );
  }

  @ApiOperation({ summary: 'update template' })
  @UseGuards(IsTemplateExistGuard)
  @Patch('update-template/:id')
  public updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    return this.templateService.updateTemplate(id, dto);
  }

  @ApiOperation({ summary: 'create template' })
  @Post('create-template')
  public createTemplate(
    @User() user: UserDto,
    @Body() dto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    return this.templateService.createTemplate(
      user.id,
      user.member.teamId,
      dto,
    );
  }

  @ApiOperation({ summary: 'delete templates' })
  @Delete('delete-templates')
  public deleteTemplates(@Query() dto: ParamsIdsDto): Promise<void> {
    return this.templateService.deleteTemplates(dto.ids);
  }
}
