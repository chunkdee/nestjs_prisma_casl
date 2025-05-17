import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaClient } from '@prisma/client';
import { AbilityFactory } from './casl-ability.factory';
import { AbilityProvider } from './casl-ability.provider';
import { AbilityGuard } from './casl-ability.guard';
import { PRISMA_CLIENT, ABILITY_TOKEN, CLS_SERVICE } from './casl.constants';

interface CaslModuleConfig {
  prismaService: PrismaClient;
  cls: ClsService;
}

interface CaslModuleAsyncConfig extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<CaslModuleConfig> | CaslModuleConfig;
  inject?: any[];
}

@Module({})
export class OctoCaslModule {
  static forRootAsync(options: CaslModuleAsyncConfig): DynamicModule {
    return {
      global: true,
      module: OctoCaslModule,
      imports: options.imports || [],
      providers: [
        {
          provide: PRISMA_CLIENT,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.prismaService;
          },
          inject: options.inject || [],
        },
        {
          provide: CLS_SERVICE,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.cls;
          },
          inject: options.inject || [],
        },
        AbilityProvider,
        AbilityFactory,
        AbilityGuard,
      ],
      exports: [ABILITY_TOKEN,CLS_SERVICE, AbilityProvider,AbilityFactory],
    };
  }
}