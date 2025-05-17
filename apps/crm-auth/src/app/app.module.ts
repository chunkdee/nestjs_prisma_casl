import { Module } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { OctoCaslModule } from '@my-workspace/octo-casl';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    PrismaModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => crypto.randomUUID(),
      },
    }),
    OctoCaslModule.forRootAsync({
      imports: [ClsModule],
      inject: [ClsService, PrismaService],
      useFactory: (cls: ClsService, prisma: PrismaService) => ({
        prismaService: prisma,
        cls: cls
      }),
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}