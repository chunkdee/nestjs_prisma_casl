import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {AbilityGuard,CheckAbilities} from  '@my-workspace/octo-casl'

@Controller('users')
@UseGuards(JwtAuthGuard,AbilityGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckAbilities({ action: 'Read', subject: 'User' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':email')
  @CheckAbilities({ action: 'Read', subject: 'User' })
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }
}
