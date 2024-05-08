import { BadRequestException, Injectable } from '@nestjs/common';
import { EarlyAccessUserDto } from './dto/response-dto/early-access-user.dto';
import { EntityManager } from 'src/dal/entity-manager';
import { CreateEarlyAccessUserDto } from './dto/request-dto/create-early-access-user.dto';

@Injectable()
export class EarlyAccessUserService {
  constructor(private readonly entityManager: EntityManager) {}

  public async createEarlyAccessUser(
    data: CreateEarlyAccessUserDto,
  ): Promise<EarlyAccessUserDto> {
    const existingUser =
      await this.entityManager.earlyAccessUserRepository.findEarlyAccessUser(
        data.email,
      );

    if (existingUser) {
      throw new BadRequestException(
        'Your email is already saved. We will contact you later.',
      );
    }

    return this.entityManager.earlyAccessUserRepository.createEarlyAccessUser(
      data,
    );
  }

  public async getEarlyAccessUsers(): Promise<EarlyAccessUserDto[]> {
    return this.entityManager.earlyAccessUserRepository.getAllEarlyAccessUsers();
  }
}
