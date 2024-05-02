import { SubscriptionType } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSubscriptionDto } from 'src/subscription/dto/request-dto/create-subscription.dto';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe = new Stripe(
    this.configService.get<string>('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2023-10-16',
    },
  );
  constructor(private readonly configService: ConfigService) {}

  public async createSubscriptionCheckoutSession(
    email: string,
    data: CreateSubscriptionDto,
  ): Promise<{ sessionId: string; sessionUrl: string }> {
    const price =
      data.type === SubscriptionType.MONTHLY
        ? this.configService.get<string>('STRIPE_MONTHLY_ID')
        : this.configService.get<string>('STRIPE_YEARLY_ID');

    const session = await this.stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      locale: 'en',
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      mode: 'subscription',

      allow_promotion_codes: true,
      success_url: data.successUrl
        ? this.configService.get<string>('CLIENT_URL') + data.successUrl
        : this.configService.get<string>('CLIENT_SUCCESS_URL'),
      cancel_url: this.configService.get<string>('CLIENT_CANCEL_URL'),
    });

    return { sessionId: session.id, sessionUrl: session.url };
  }

  public async webhook(body): Promise<any> {
    const event = body;

    let subscription: Stripe.Subscription;
    let status: Stripe.Subscription.Status;

    switch (event.type) {
      case 'customer.subscription.created':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(subscription);
        return {
          eventType: event.type,
          subscriptionId: subscription.id,
          customerId: String(subscription.customer),
          sessionId: await this.getSessionIdBySubscriptionId(subscription.id),
          nextPayment: new Date(subscription.current_period_end * 1000),
        };
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(subscription);
        return {
          eventType: event.type,
          subscriptionId: subscription.id,
          customerId: String(subscription.customer),
          sessionId: await this.getSessionIdBySubscriptionId(subscription.id),
        };
      case 'customer.subscription.updated':
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(subscription);
        return {
          eventType: event.type,
          subscriptionId: subscription.id,
          nextPayment: new Date(subscription.current_period_end * 1000),
        };
      case 'customer.invoice.payment_failed':
        return {
          eventType: event.type,
        };
      default:
        return false;
    }
  }

  private async getSessionBySubscriptionId(
    subscriptionId: string,
  ): Promise<any> {
    const sessions = await this.stripe.checkout.sessions.list({
      subscription: subscriptionId,
    });

    return sessions.data[0];
  }

  private async getSessionIdBySubscriptionId(
    subscriptionId: string,
  ): Promise<string> {
    return (await this.getSessionBySubscriptionId(subscriptionId)).id;
  }

  public async cancelSubscription(subscriptionId: string): Promise<Date> {
    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true },
      );
      return new Date(subscription.current_period_end * 1000);
    } catch (err) {
      throw new BadRequestException(
        'Error occurred while subscription cancellation',
      );
    }
  }

  async createPortalSession(subscriptionId: string, returnUrl: string) {
    const session = await this.getSessionBySubscriptionId(subscriptionId);

    const portalConfiguration =
      await this.stripe.billingPortal.configurations.create({
        business_profile: {
          headline: null,
          privacy_policy_url: 'https://example.com/privacy',
          terms_of_service_url: 'https://example.com/terms',
        },
        features: {
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'name', 'address', 'phone', 'tax_id'],
          },
          invoice_history: {
            enabled: true,
          },
          payment_method_update: {
            enabled: true,
          },
          subscription_cancel: {
            enabled: false,
          },
          subscription_pause: {
            enabled: false,
          },
        },
      });

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: String(session.customer),
      return_url: this.configService.get<string>('CLIENT_URL') + returnUrl,
      locale: 'en',
      configuration: portalConfiguration.id,
    });

    return portalSession.url;
  }
}
