import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { OctoCaslModule } from '@my-workspace/octo-casl';
import { NestCacheModule } from './cache/cache.module';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';


@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
      },
    }),
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
        prismaService: prisma,
        cls: cls,
        cacheManager: cacheManager,
      }),
    }),
    TenantModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // apply on all routes or scope as needed
  }
}