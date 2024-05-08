import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../../dal/entity-manager';

@Injectable()
export class IsTemplateExistGuard implements CanActivate {
  constructor(private readonly entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const templateId = request.params?.id;

    const template =
      await this.entityManager.templateRepository.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException(`Template doesn't exist`);
    }

    return true;
  }
}
