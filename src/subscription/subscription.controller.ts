import { CreateSubscriptionDto } from 'src/subscription/dto/request-dto/create-subscription.dto';
import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { User } from 'src/user/user.decorator';
import { UserDto } from 'src/user/dto/response-dto/user.dto';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { SubscriptionDto } from './dto/response-dto/subscription.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreatePortalSessionDto } from './dto/request-dto/create-portal-session.dto';
import { SubscriptionGuard } from './guards/subscription.guard';

@Controller('subscription')
@ApiTags('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiCookieAuth()
  @Get('get-subscription')
  public getSubscriptionByUserId(
    @User() user: UserDto,
  ): Promise<SubscriptionDto> {
    return this.subscriptionService.findSubscriptionByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @Post('create-subscription')
  public createSubscription(
    @User() user: UserDto,
    @Body() data: CreateSubscriptionDto,
  ): Promise<string> {
    return this.subscriptionService.createSubscription(user, data);
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiCookieAuth()
  @Post('cancel-subscription')
  public cancelSubscription(@User() user: UserDto): Promise<void> {
    return this.subscriptionService.cancelSubscription(user.id);
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiCookieAuth()
  @Post('create-portal-session')
  createPortalSession(
    @User() user: UserDto,
    @Body() createPortalSessionDto: CreatePortalSessionDto,
  ): Promise<string> {
    return this.subscriptionService.createPortalSession(
      user.id,
      createPortalSessionDto,
    );
  }

  @Post('webhook')
  async webhook(@Req() req: Request): Promise<void> {
    await this.subscriptionService.webhook(req.body);
  }
}
