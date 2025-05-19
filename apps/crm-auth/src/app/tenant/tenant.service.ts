import { Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { PrismaExtensionRedis, type AutoCacheConfig, type CacheConfig, CacheCase } from 'prisma-extension-redis';
import { PrismaService } from '../prisma/prisma.service';

// Define a type for the extended Prisma Client
//type ExtendedPrismaClient = PrismaClient & ReturnType<typeof PrismaExtensionRedis>;

@Injectable()
export class TenantService implements OnModuleInit, OnModuleDestroy {
  // Map to hold tenant-specific extended Prisma clients
  private tenantClients: Map<string, any> = new Map();
  // Map to hold tenant database URLs (key can be tenant name or id)
  private tenantDatabaseUrls: Map<string, string> = new Map();
  
  // Inject CLS, Pino Logger, and PrismaService for loading tenant information
  constructor(
    private readonly cls: ClsService,
    private readonly logger: Logger,
    private readonly prismaService: PrismaService
  ) {}

  async onModuleInit() {
    // Create Redis client configuration
    const redisClient = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    };

    // Define auto-cache configuration for PrismaExtensionRedis
    const auto: AutoCacheConfig = {
      excludedModels: ['Post'],
      excludedOperations: [],
      models: [
        {
          model: 'User',
          excludedOperations: [],
          ttl: 120,
          stale: 30,
        },
      ],
      ttl: 30,
    };

    const config: CacheConfig = {
      ttl: 60,
      stale: 30,
      auto,
      logger: this.logger,
     onHit: (key: string) => console.log(`FOUND CACHE: ${key}`),
     onMiss: (key: string) => console.log(`NOT FOUND CACHE: ${key}`),
      type: 'JSON',
      cacheKey: {
        case: CacheCase.SNAKE_CASE,
        delimiter: ':',
        prefix: 'octocrm',
      },
    };

    // Load tenant information from the database using PrismaService.
    // It's assumed you have a Tenant table with fields `name` and `databaseUrl`
    let tenants;
    try {
      tenants = await this.prismaService.tenant.findMany();
      this.logger.log(`Loaded ${tenants.length} tenant(s) from the database.`);
    } catch (error) {
      this.logger.error('Failed to load tenants from the database:', error);
      throw new InternalServerErrorException('Could not load tenant configurations.');
    }

    // Populate the tenantDatabaseUrls map with tenant information
    for (const tenant of tenants) {
      // Adjust property names as needed (for example, tenant.name and tenant.databaseUrl)
      if (tenant.name && tenant.databaseUrl) {
        this.tenantDatabaseUrls.set(tenant.name, tenant.databaseUrl);
        this.logger.log(`Configured tenant ${tenant.name}`);
      } else {
        this.logger.warn(`Skipping tenant record with missing name or databaseUrl: ${JSON.stringify(tenant)}`);
      }
    }

    // Initialize Prisma clients for all known tenants based on the loaded configuration
    for (const [tenantId, dbUrl] of this.tenantDatabaseUrls.entries()) {
      try {
        const client = new PrismaClient({
          datasources: {
            db: { url: dbUrl },
          },
        });
        
        // Extend the Prisma client with Redis auto-caching functionality
        const extendedPrismaClient = client.$extends(PrismaExtensionRedis({ config, client: redisClient }));
        await extendedPrismaClient.$connect();
        this.tenantClients.set(tenantId, extendedPrismaClient);
        this.logger.log(`Prisma client connected for tenant: ${tenantId}`);
      } catch (error) {
        this.logger.error(`Failed to connect Prisma client for tenant ${tenantId}:`, error);
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting all Prisma clients...');
    for (const [tenantId, client] of this.tenantClients.entries()) {
      try {
        await client.$disconnect();
        this.logger.log(`Prisma client disconnected for tenant: ${tenantId}`);
      } catch (error) {
        this.logger.error(`Failed to disconnect Prisma client for tenant ${tenantId}:`, error);
      }
    }
  }

  /**
   * Retrieves the ExtendedPrismaClient instance for the current tenant based on CLS context.
   * @throws Error if the tenant context is not found or no client is initialized.
   */
  getClient(): any {
    let tenantId = this.cls.get('tenantId') as string;
    if (!tenantId) {
      this.logger.log('currently using default tenanat  tenant1');
       tenantId = 'tenant1';
     // throw new InternalServerErrorException('Tenant context not found in CLS.');
    }
    const client = this.tenantClients.get(tenantId);
    if (!client) {
      throw new InternalServerErrorException(`Prisma client not found for tenant: ${tenantId}.`);
    }
    return client;
  }

   /** 
   * Retrieves the current tenant ID from the CLS context. 
   * @returns The current tenant ID. 
   * @throws Error if the tenant context is not found. 
   */ 
  getCurrentTenantId(): string { 
       let tenantId = this.cls.get('tenantId') as string; 
       if (!tenantId) { 
          this.logger.log('currently using default tenanat  tenant1');
          tenantId = 'tenant1'; 
          // throw new InternalServerErrorException('Tenant ID not found in CLS context.'); 
       } 
       return tenantId; 
  }
}
