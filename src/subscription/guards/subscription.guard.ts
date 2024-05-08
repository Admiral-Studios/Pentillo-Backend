import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;

    const subscribtion =
      await this.subscriptionService.findSubscriptionByUserId(userId);

    if (
      !subscribtion.startDate ||
      (subscribtion.endDate && subscribtion.endDate < new Date())
    ) {
      throw new ForbiddenException(`No subscription found`);
    }
    return true;
  }
}
