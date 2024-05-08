import { Body, Controller, Get, Post } from '@nestjs/common';
import { EarlyAccessUserService } from './early-access-user.service';
import { EarlyAccessUserDto } from './dto/response-dto/early-access-user.dto';
import { CreateEarlyAccessUserDto } from './dto/request-dto/create-early-access-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('early access user')
@Controller('early-access-user')
export class EarlyAccessUserController {
  constructor(
    private readonly earlyAccessUserService: EarlyAccessUserService,
  ) {}

  @ApiOperation({ summary: 'create early access user' })
  @Post()
  public createEarlyAccessUser(
    @Body() data: CreateEarlyAccessUserDto,
  ): Promise<EarlyAccessUserDto> {
    return this.earlyAccessUserService.createEarlyAccessUser(data);
  }

  @Get()
  public getEarlyAccessUsers(): Promise<EarlyAccessUserDto[]> {
    return this.earlyAccessUserService.getEarlyAccessUsers();
  }
}
