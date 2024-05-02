import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { UserRepository } from './user/user.repository';
import { SubscriptionRepository } from './subscription/subscription.repository';
import { FileRepository } from './file/file.repository';
import { PrismaClient } from '@prisma/client';
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
import { EarlyAccessUserRepository } from './early-access-user/early-access-user.repository';
import { TemplateRepository } from './template/template.repository';
import { ContactRepository } from './contact/contact.repository';
import { NotesRepository } from './notes/notes.repository';

@Injectable()
export class EntityManager {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly _userRepository: UserRepository,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _fileRepository: FileRepository,
    private readonly _transactionRepository: TransactionRepository,
    private readonly _transactionNotesRepository: TransactionNotesRepository,
    private readonly _ListRepository: ListRepository,
    private readonly _DateRepository: DateRepository,
    private readonly _teamRepository: TeamRepository,
    private readonly _roleRepository: RoleRepository,
    private readonly _memberRepository: MemberRepository,
    private readonly _taskRepository: TaskRepository,
    private readonly _subTaskRepository: SubTaskRepository,
    private readonly _invitationRepository: InvitationRepository,
    private readonly _earlyAccessUserRepository: EarlyAccessUserRepository,
    private readonly _templateRepository: TemplateRepository,
    private readonly _contactRepository: ContactRepository,
    private readonly _notesRepository: NotesRepository,
  ) {}

  public get userRepository(): UserRepository {
    return this._userRepository;
  }

  public get contactRepository(): ContactRepository {
    return this._contactRepository;
  }

  public get subscriptionRepository(): SubscriptionRepository {
    return this._subscriptionRepository;
  }

  public get fileRepository(): FileRepository {
    return this._fileRepository;
  }

  public get transactionRepository(): TransactionRepository {
    return this._transactionRepository;
  }

  public get transactionNotesRepository(): TransactionNotesRepository {
    return this._transactionNotesRepository;
  }

  public get listRepository(): ListRepository {
    return this._ListRepository;
  }

  public get dateRepository(): DateRepository {
    return this._DateRepository;
  }

  public get teamRepository(): TeamRepository {
    return this._teamRepository;
  }

  public get roleRepository(): RoleRepository {
    return this._roleRepository;
  }

  public get memberRepository(): MemberRepository {
    return this._memberRepository;
  }

  public get taskRepository(): TaskRepository {
    return this._taskRepository;
  }

  public get subTaskRepository(): SubTaskRepository {
    return this._subTaskRepository;
  }

  public get invitationRepository(): InvitationRepository {
    return this._invitationRepository;
  }

  public get earlyAccessUserRepository(): EarlyAccessUserRepository {
    return this._earlyAccessUserRepository;
  }

  public get templateRepository(): TemplateRepository {
    return this._templateRepository;
  }

  public get notesRepository(): NotesRepository {
    return this._notesRepository;
  }

  public get transaction(): typeof PrismaClient.prototype.$transaction {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
