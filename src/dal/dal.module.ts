import { Module } from '@nestjs/common';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { EntityManager } from './entity-manager';
import { UserRepository } from './user/user.repository';
import { SubscriptionRepository } from './subscription/subscription.repository';
import { FileRepository } from './file/file.repository';
import { TransactionRepository } from './transaction/transaction.repository';
import { TransactionNotesRepository } from './transaction-notes/transaction-notes.repository';
import { ListRepository } from './list/list.repository';
import { DateRepository } from './date/date.repository';
import { TeamRepository } from './team/team.repository';
import { RoleRepository } from './role/role.repository';
import { MemberRepository } from './member/member.repository';
import { TaskRepository } from './task/task.repository';
import { SubTaskRepository } from './sub-tasks/sub-tasks.repository';
import { InvitationRepository } from './invitation/invitation.repository';
import { ContactRepository } from './contact/contact.repository';
import { EarlyAccessUserRepository } from './early-access-user/early-access-user.repository';
import { TemplateRepository } from './template/template.repository';
import { NotesRepository } from './notes/notes.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    EntityManager,
    UserRepository,
    SubscriptionRepository,
    FileRepository,
    TransactionRepository,
    TransactionNotesRepository,
    ListRepository,
    DateRepository,
    TeamRepository,
    RoleRepository,
    MemberRepository,
    TaskRepository,
    SubTaskRepository,
    InvitationRepository,
    ContactRepository,
    EarlyAccessUserRepository,
    TemplateRepository,
    NotesRepository,
  ],
  exports: [
    EntityManager,
    UserRepository,
    FileRepository,
    SubscriptionRepository,
    TransactionRepository,
    TransactionNotesRepository,
    ListRepository,
    DateRepository,
    TeamRepository,
    RoleRepository,
    MemberRepository,
    TaskRepository,
    SubTaskRepository,
    InvitationRepository,
    ContactRepository,
    EarlyAccessUserRepository,
    TemplateRepository,
    NotesRepository,
  ],
})
export class DalModule {}
