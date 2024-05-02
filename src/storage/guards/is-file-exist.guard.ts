import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../../dal/entity-manager';

@Injectable()
export class IsFileExistGuard implements CanActivate {
  constructor(private readonly entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileId = request.params?.fileId;

    const file = await this.entityManager.fileRepository.getFileById(fileId);

    if (!file) {
      throw new NotFoundException(`File doesn't exist`);
    }

    return true;
  }
}
