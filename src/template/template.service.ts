import { Injectable } from '@nestjs/common';
import { EntityManager } from '../dal/entity-manager';
import { plainToInstance } from 'class-transformer';
import { CreateTemplateDto } from './dto/request-dto/create-template.dto';
import { TemplateResponseDto } from './dto/response-dto/response-template.dto';
import { GetTemplateList } from './dto/request-dto/get-template-list.dto';
import { Prisma, Team } from '@prisma/client';
import { TemplateListResponse } from './dto/response-dto/response-template-list.dto';
import { UpdateTemplateDto } from './dto/request-dto/update-template.dto';
import { DuplicateTemplateTransform } from '../dal/template/transformations/duplicate-template.transform';
import { SelectListFieldsTransform } from '../dal/list/transformations/exclude-list-fields.transform';

@Injectable()
export class TemplateService {
  constructor(private readonly entityManager: EntityManager) {}

  public async createTemplate(
    userId: string,
    teamId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.entityManager.templateRepository.createTemplate(
      userId,
      teamId,
      dto,
    );

    return plainToInstance(TemplateResponseDto, template);
  }

  public async getTemplateById(id: string): Promise<TemplateResponseDto> {
    const template =
      await this.entityManager.templateRepository.getTemplateById(id);

    return plainToInstance(TemplateResponseDto, template);
  }

  public async duplicateTemplate(
    id: string,
    userId: string,
    teamId: string,
  ): Promise<TemplateResponseDto> {
    const [template, templateLists] = await Promise.all([
      this.getTemplateById(id),
      this.entityManager.listRepository.getListByTemplateId(id),
    ]);

    const transformTemplate = plainToInstance(
      DuplicateTemplateTransform,
      template,
    );

    const transformLists = plainToInstance(
      SelectListFieldsTransform,
      templateLists,
    );

    return this.entityManager.transaction(
      async (tx: Prisma.TransactionClient) => {
        const listIds = await this.entityManager.listRepository.createManyLists(
          userId,
          transformLists,
          tx,
        );

        const duplicateTemplate =
          await this.entityManager.templateRepository.createTemplate(
            userId,
            teamId,
            { ...transformTemplate, listIds },
            tx,
          );

        return plainToInstance(TemplateResponseDto, duplicateTemplate);
      },
    );
  }

  public async deleteTemplates(ids: string[]): Promise<void> {
    await this.entityManager.templateRepository.deleteTemplates(ids);
  }

  public async getTemplateNames(
    teamId: string,
    filter: GetTemplateList,
  ): Promise<string[]> {
    const templates =
      await this.entityManager.templateRepository.getTemplateNames(
        teamId,
        filter,
      );

    return [...new Set(templates.map((template) => template.name))];
  }

  public async getTemplateList(
    teamId: string,
    filter: GetTemplateList,
  ): Promise<TemplateListResponse> {
    const data = await this.entityManager.transaction(
      async (tx: Prisma.TransactionClient) => {
        return this.entityManager.templateRepository.getTemplateList(
          teamId,
          filter,
          tx,
        );
      },
    );

    return plainToInstance(TemplateListResponse, data);
  }

  public async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.entityManager.templateRepository.updateTemplate(
      id,
      dto,
    );

    return plainToInstance(TemplateResponseDto, template);
  }
}
