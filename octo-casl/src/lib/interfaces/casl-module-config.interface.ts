import { ModuleMetadata } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Cache } from 'cache-manager';

export interface CaslModuleConfig {
  prismaService: PrismaClient;
  cls: ClsService;
  cacheManager?: Cache;
}

export interface CaslModuleAsyncConfig extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<CaslModuleConfig> | CaslModuleConfig;
  inject?: any[];
}