import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { DalModule } from 'src/dal/dal.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';

@Module({
  imports: [StripeModule, DalModule, SendgridModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
