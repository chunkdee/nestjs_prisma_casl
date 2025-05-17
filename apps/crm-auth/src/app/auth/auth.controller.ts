import { Controller, UseGuards, Body, ValidationPipe, Req } from '@nestjs/common';
import { Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/auth.dto';

interface User {
  id: number;
  email: string;
  password: string;
  roleId: number;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: Request) {
        if (!req.user) {
            throw new Error('User not found');
        }
        const user = req.user as User;
        return await this.authService.login(user);
    }

    @Post('register')
    async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
        return await this.authService.createUser(
            registerDto.email,
            registerDto.password
        );
    }
}