import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { TeamService } from './team.service';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { TeamDto } from './dto/response-dto/team.dto';
import { User } from 'src/user/user.decorator';
import { UserDto } from 'src/user/dto/response-dto/user.dto';
import { RoleDto } from 'src/role/dto/response-dto/role.dto';
import { CreateRoleDto } from 'src/role/dto/request-dto/create-role.dto';
import { EditRoleDto } from 'src/role/dto/request-dto/edit-role.dto';
import { KickMemberDto } from './dto/request-dto/kick-member.dto';
import { IsOwnerGuard } from './guards/is-owner.guard';
import { AddMemberOnTransactionDto } from './dto/request-dto/add-member-on-transaction.dto';
import { MemberDto } from './dto/response-dto/member.dto';
import { GetMembersDto } from './dto/request-dto/get-members.dto';
import { SetMemberRoleDto } from './dto/request-dto/set-member-role.dto';
import { UpdateMemberDto } from './dto/request-dto/update-member.dto';
import { AllMembersDto } from './dto/response-dto/all-members.dto';
import { SearchMembersDto } from './dto/request-dto/search-members.dto';

@UseGuards(JwtAuthGuard)
@Controller('team')
@ApiTags('team')
@ApiCookieAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  public getAllTeams(@User() user: UserDto): Promise<TeamDto> {
    return this.teamService.findTeamByUserId(user.id);
  }

  @Get('roles')
  public getRoles(@User() user: UserDto): Promise<RoleDto[]> {
    return this.teamService.getRoles(user.id);
  }

  @Get('all-roles')
  public getAllRoles(@User() user: UserDto): Promise<RoleDto[]> {
    return this.teamService.getAllRoles(user.id);
  }

  @ApiOperation({ summary: 'Export members' })
  @Get('export-members')
  public async exportMembers(
    @User('id') userId: string,
    @Query() filter: GetMembersDto,
    @Res() res: Response,
  ): Promise<void> {
    const { csvWriter, records } = await this.teamService.exportMembers(
      userId,
      filter,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=members.csv`);

    res.write(csvWriter.getHeaderString());
    res.write(csvWriter.stringifyRecords(records));

    res.end();
  }

  @Get('members')
  public getMembers(
    @User() user: UserDto,
    @Query() filter: GetMembersDto,
  ): Promise<AllMembersDto> {
    return this.teamService.getMembers(user.id, filter);
  }

  @Get('member/:memberId')
  public getMember(@Param('memberId') memberId: string): Promise<MemberDto> {
    return this.teamService.getMemberById(memberId);
  }

  @UseGuards(IsOwnerGuard)
  @Post('create-role')
  public createRole(
    @User() user: UserDto,
    @Body() data: CreateRoleDto,
  ): Promise<RoleDto> {
    return this.teamService.createRole(user.id, data);
  }

  @UseGuards(IsOwnerGuard)
  @Patch('update-role')
  public updateRole(@Body() data: EditRoleDto): Promise<RoleDto> {
    return this.teamService.updateRole(data);
  }

  @UseGuards(IsOwnerGuard)
  @Patch('set-member-role')
  public updateMemberRole(@Body() data: SetMemberRoleDto): Promise<MemberDto> {
    return this.teamService.setMemberRole(data);
  }

  @UseGuards(IsOwnerGuard)
  @Delete('delete-role/:roleId')
  public deleteRole(@Param('roleId') roleId: string): Promise<RoleDto> {
    return this.teamService.deleteRole(roleId);
  }

  @Delete('leave-team')
  public leaveTeam(@User() user: UserDto): Promise<TeamDto> {
    return this.teamService.leaveTeam(user.id);
  }

  @UseGuards(IsOwnerGuard)
  @Delete('kick-members')
  public async kickMembers(@Body() data: KickMemberDto): Promise<void> {
    await this.teamService.kickMembers(data);
  }

  @UseGuards(IsOwnerGuard)
  @Post('add-member-on-transaction')
  public addMemberOnTransaction(
    @Body() data: AddMemberOnTransactionDto,
  ): Promise<MemberDto> {
    return this.teamService.addMemberOnTransaction(data);
  }

  @UseGuards(IsOwnerGuard)
  @Delete('remove-member-on-transaction')
  public removeMemberOnTransaction(
    @Body() data: AddMemberOnTransactionDto,
  ): Promise<MemberDto> {
    return this.teamService.removeMemberOnTransaction(data);
  }

  @UseGuards(IsOwnerGuard)
  @Patch('update-member')
  public updateMember(@Body() data: UpdateMemberDto): Promise<MemberDto> {
    return this.teamService.updateMember(data);
  }

  @Post('search-members')
  public searchMembers(
    @User() user: UserDto,
    @Body() data: SearchMembersDto,
  ): Promise<MemberDto[]> {
    return this.teamService.searchMembers(user.id, data);
  }

  @Get('is-owner')
  public isOwner(@User('id') userId): Promise<boolean> {
    return this.teamService.isOwner(userId);
  }
}
