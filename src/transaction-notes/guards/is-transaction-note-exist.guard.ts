import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../../dal/entity-manager';

@Injectable()
export class IsTransactionNoteExistGuard implements CanActivate {
  constructor(private readonly entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const noteId = request.params?.noteId;

    const note =
      await this.entityManager.transactionNotesRepository.getTransactionNoteById(
        noteId,
      );

    if (!note) {
      throw new NotFoundException(`Transaction note doesn't exist`);
    }

    return true;
  }
}
