import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../../dal/entity-manager';

@Injectable()
export class IsTransactionExistGuard implements CanActivate {
  constructor(private readonly entityManager: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const transactionId =
      request.params?.id ||
      request.params?.transactionId ||
      request.body?.transactionId;

    const transaction =
      await this.entityManager.transactionRepository.getTransactionById(
        transactionId,
      );

    if (!transaction) {
      throw new NotFoundException(`Transaction doesn't exist`);
    }

    return true;
  }
}
