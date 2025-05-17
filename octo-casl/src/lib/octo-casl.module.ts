import { DynamicModule, Module } from '@nestjs/common';
import { AbilityFactory } from './casl-ability.factory';
import { AbilityGuard } from './casl-ability.guard';
import { PRISMA_CLIENT, CLS_SERVICE, CASL_CACHE_MANAGER } from './casl.constants';
import { CaslModuleAsyncConfig } from './interfaces/casl-module-config.interface';

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
         {
          provide: CASL_CACHE_MANAGER,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.cacheManager;
          },
          inject: options.inject || [],
        },
        AbilityFactory,
        AbilityGuard,
      ],
      exports: [CLS_SERVICE, CASL_CACHE_MANAGER,AbilityFactory],
    };
  }
}