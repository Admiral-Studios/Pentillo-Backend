import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'src/dal/entity-manager';
import { SubscriptionDto } from './dto/response-dto/subscription.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { CreatePortalSessionDto } from './dto/request-dto/create-portal-session.dto';
import { CreateSubscriptionDto } from './dto/request-dto/create-subscription.dto';
import { UserDto } from 'src/user/dto/response-dto/user.dto';

@Injectable()
export class SubscriptionService {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly stripeService: StripeService,
    private readonly sendgridService: SendgridService,
  ) {}

  public async createSubscription(
    user: UserDto,
    data: CreateSubscriptionDto,
  ): Promise<string> {
    const { sessionId, sessionUrl } =
      await this.stripeService.createSubscriptionCheckoutSession(
        user.email,
        data,
      );

    const sub =
      await this.entityManager.subscriptionRepository.createSubscription({
        stripeSessionId: sessionId,
        userId: user.id,
        type: data.type,
      });
    console.log(sub);
    return sessionUrl;
  }

  public async findSubscriptionByUserId(
    userId: string,
  ): Promise<SubscriptionDto> {
    try {
      const subscription =
        await this.entityManager.subscriptionRepository.findSubscription({
          userId,
        });
      if (!subscription) throw new NotFoundException('Subscription not found');

      return subscription;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async cancelSubscription(id: string): Promise<void> {
    const subscription =
      await this.entityManager.subscriptionRepository.findSubscription({
        userId: id,
      });

    const date = await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    await this.sendgridService.sendCancelSubscriptionEmail(subscription.userId);

    await this.entityManager.subscriptionRepository.updateSubscription(
      subscription.id,
      {
        isActive: false,
        endDate: new Date(date),
      },
    );
  }

  public deleteSubscription(id: string) {
    return this.entityManager.subscriptionRepository.deleteSubscription(id);
  }

  async createPortalSession(userId: string, data: CreatePortalSessionDto) {
    const subscription = await this.findSubscriptionByUserId(userId);
    return await this.stripeService.createPortalSession(
      subscription.stripeSubscriptionId,
      data.returnUrl,
    );
  }

  async webhook(body): Promise<void> {
    console.log(body);
    const res = await this.stripeService.webhook(body);
    if (res && res.eventType === 'customer.subscription.created') {
      const startDate = Date.now();
      console.log(res);
      const subscription =
        await this.entityManager.subscriptionRepository.findSubscription({
          stripeSessionId: res.sessionId,
        });

      await this.sendgridService.sendAccessPaymentEmail(subscription.userId);
      await this.entityManager.subscriptionRepository.updateSubscription(
        subscription.id,
        {
          isActive: true,
          stripeSubscriptionId: res.subscriptionId,
          stripeCustomerId: res.customerId,
          startDate: new Date(startDate),
          nextPayment: res.nextPayment,
        },
      );
    } else if (res.eventType === 'customer.subscription.deleted') {
      const subscription =
        await this.entityManager.subscriptionRepository.findSubscription({
          stripeSubscriptionId: res.subscriptionId,
        });

      await this.entityManager.subscriptionRepository.deleteSubscription(
        subscription.id,
      );
    } else if (res.eventType === 'customer.subscription.updated') {
      const subscription =
        await this.entityManager.subscriptionRepository.findSubscription({
          stripeSubscriptionId: res.subscriptionId,
        });

      await this.entityManager.subscriptionRepository.updateSubscription(
        subscription.id,
        {
          nextPayment: res.nextPayment,
        },
      );
    } else if (res.eventType === 'customer.invoice.payment_failed') {
      const subscription =
        await this.entityManager.subscriptionRepository.findSubscription({
          stripeSubscriptionId: res.subscriptionId,
        });

      await this.sendgridService.sendUpdateSubscriptionEmail(
        subscription.userId,
      );
    }
  }
}
