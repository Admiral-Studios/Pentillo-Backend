import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { EmailDataDto } from './dto/request-dto/email-data.dto';
import { EntityManager } from '../dal/entity-manager';
import { RedisService } from '../infra/redis/redis.service';
import { generateRandomCode } from '../common/helpers/helpers';

@Injectable()
export class SendgridService {
  constructor(
    @InjectQueue('email')
    private mailQueue: Queue,
    private configService: ConfigService,
    private entityManager: EntityManager,
    private redisService: RedisService,
  ) {}

  private async sendEmail(
    to: string,
    templateId: string,
    data?: EmailDataDto,
  ): Promise<void> {
    try {
      await this.mailQueue.add('send', {
        to: to,
        templateId: templateId,
        data: data,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  public async sendGreetingsEmail(id: string): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      const fullName = user ? user.firstName + ' ' + user.lastName : 'Guest';
      this.sendEmail(
        user.email,
        this.configService.get<string>('TEMPLATE_ID_GREETINGS'),
        {
          user: fullName,
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendConfirmationCode(
    id: string,
    newEmail?: string,
  ): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      const fullName = user ? user.firstName + ' ' + user.lastName : 'Guest';

      const code = generateRandomCode();

      await this.redisService.setex(id, { code, newEmail });

      this.sendEmail(
        newEmail ? newEmail : user.email,
        this.configService.get<string>('TEMPLATE_ID_CONFIRMATION'),
        {
          user: fullName,
          code: code,
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendRenewalSubscriptionEmail(
    id: string,
    endDate: Date,
  ): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      if (!user) throw new NotFoundException('User not found');

      const fullName = user.firstName + ' ' + user.lastName;
      this.sendEmail(
        user.email,
        this.configService.get<string>('TEMPLATE_ID_RENEWAL'),
        {
          user: fullName,
          subPlan: 'Monthly subscription',
          expTime: endDate.toDateString(),
          link: this.configService.get<string>('CLIENT_SUBSCRIPTION_URL'),
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendCancelSubscriptionEmail(id: string): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      const fullName = user.firstName + ' ' + user.lastName;
      this.sendEmail(
        user.email,
        this.configService.get<string>('TEMPLATE_ID_CANCEL'),
        {
          user: fullName,
          subPlan: 'Monthly subscription',
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendUpdateSubscriptionEmail(id: string): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      const fullName = user.firstName + ' ' + user.lastName;
      this.sendEmail(
        user.email,
        this.configService.get<string>('TEMPLATE_ID_UPDATE'),
        {
          user: fullName,
          subPlan: 'Monthly subscription',
          link: this.configService.get<string>('CLIENT_SUBSCRIPTION_URL'),
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendAccessPaymentEmail(id: string): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({ id });
      const fullName = user.firstName + ' ' + user.lastName;
      this.sendEmail(
        user.email,
        this.configService.get<string>('TEMPLATE_ID_SUCCESS'),
        {
          user: fullName,
          subPlan: 'Monthly subscription',
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async sendInvitationEmail(
    email: string,
    fullname: string,
    url: string,
  ): Promise<void> {
    try {
      this.sendEmail(
        email,
        this.configService.get<string>('TEMPLATE_ID_INVITATION'),
        {
          user: fullname,
          link: url,
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
