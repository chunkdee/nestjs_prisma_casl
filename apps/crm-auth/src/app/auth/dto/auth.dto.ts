import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString({ message: 'Email must be a string' })
    email!: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;
}

export class RegisterDto extends LoginDto {}
