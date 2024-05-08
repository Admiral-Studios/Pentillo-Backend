import { Module } from '@nestjs/common';
import { PrismaModule } from './infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { DalModule } from './dal/dal.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { StorageModule } from './storage/storage.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionNoteModule } from './transaction-notes/transaction-notes.module';
import { ListModule } from './list/list.module';
import { DateModule } from './date/date.module';
import { TeamModule } from './team/team.module';
import { TaskModule } from './task/task.module';
import { SubTasksModule } from './sub-tasks/sub-tasks.module';
import { InvitationModule } from './invitation/invitation.module';
import { RoleModule } from './role/role.module';
import { EarlyAccessUserModule } from './early-access-user/early-access-user.module';
import { TemplateModule } from './template/template.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedisModule } from './infra/redis/redis.module';
import { NotesModule } from './notes/notes.module';
import { GlobalSearchModule } from './global-search/global-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    SendgridModule,
    DalModule,
    StripeModule,
    SubscriptionModule,
    StorageModule,
    TransactionModule,
    TransactionNoteModule,
    ListModule,
    DateModule,
    TeamModule,
    TaskModule,
    SubTasksModule,
    InvitationModule,
    RoleModule,
    EarlyAccessUserModule,
    TemplateModule,
    DashboardModule,
    RedisModule,
    NotesModule,
    GlobalSearchModule,
  ],
})
export class AppModule {}
