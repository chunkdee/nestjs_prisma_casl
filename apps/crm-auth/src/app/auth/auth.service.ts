import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

interface User {
  id: number;
  email: string;
  password: string;
  roleId: number;
}

interface JwtPayload {
  email: string;
  sub: number;
  roleId: number;
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) {}

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: Omit<User, 'password'>) {
        const payload: JwtPayload = { 
            email: user.email, 
            sub: user.id,
            roleId: user.roleId 
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async createUser(email: string, password: string) {
        // Check if user already exists
        const exists = await this.usersService.findOne(email);
        if (exists) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.usersService.create({
            email,
            password: hashedPassword,
            role: {
                connect: { id: 1 } // Default role ID - you might want to make this configurable
            },
        });
        
        // Remove password from response
        const { password: _, ...result } = newUser;
        return result;
    }
}