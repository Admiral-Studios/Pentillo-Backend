import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../../dal/entity-manager';
import { TypeList } from '@prisma/client';

@Injectable()
export class IsTypeListDocumentsGuard implements CanActivate {
  constructor(private readonly entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const listId = request.params?.listId || request?.body?.listId;

    const list = await this.entityManager.listRepository.getListById(listId);

    if (!list) {
      throw new NotFoundException(`List doesn't exist`);
    }

    if (list.type !== TypeList.DOCUMENTS) {
      throw new BadRequestException('List for documents only');
    }

    return true;
  }
}
