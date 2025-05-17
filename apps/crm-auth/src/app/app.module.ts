import { Module } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { OctoCaslModule } from '@my-workspace/octo-casl';
import { NestCacheModule } from './cache/cache.module';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';


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
    NestCacheModule,
    OctoCaslModule.forRootAsync({
      imports: [ClsModule, NestCacheModule],
      inject: [ClsService, PrismaService, CACHE_MANAGER],
      useFactory: (cls: ClsService, prisma: PrismaService, cacheManager: Cache) => ({
        cacheManager: cacheManager,
        prismaService: prisma,
        cls: cls,
      }),
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}