import { Injectable } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { User, Prisma } from '@prisma/client';


// Ensure this type aligns with your extended Prisma client (with caching extension)
//type ExtendedPrismaClient = Prisma.PrismaClient & {
//  user: {
//    findUnique<T extends Prisma.UserFindUniqueArgs>(args: T): Promise<Prisma.UserGetPayload<T>> & {
//      useCache(options: { tags: string[] }): Promise<Prisma.UserGetPayload<T>>
//    },
//    findMany<T extends Prisma.UserFindManyArgs>(args?: T): Promise<Prisma.UserGetPayload<T>[]> & {
//      useCache(options: { tags: string[] }): Promise<Prisma.UserGetPayload<T>[]>
//    }
//  }
//};

@Injectable()
export class UsersService {
  constructor(private readonly tenantService: TenantService) {}
 


  async findOne(email: string): Promise<User | null> {
    const tenantPrismaCient = this.tenantService.getClient();
    const tenantId = this.tenantService.getCurrentTenantId;

    const customKey = tenantPrismaCient.getKey({ params: [{ prisma: 'User' }, { email: email }] });
    // Use cache with tags ([tenantId, 'user'])
    return tenantPrismaCient.user.findUnique({
      where: { email },
      cache: { ttl: 5, key: customKey }, // Custom TTL and cache key

    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const prisma = this.tenantService.getClient();
    // Note: For create operations, you might want to invalidate cache entries for 'user' if needed.
    return prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<User[]> {
    const tenantPrismaCient = this.tenantService.getClient();
    const tenantId =  this.tenantService.getCurrentTenantId;
    // Use cache with tags ([tenantId, 'user'])
    return tenantPrismaCient.user.findMany({
      cache: { ttl: 5, tags: [tenantId, 'user'] }, // Custom TTL and cache key    ;
    });
  }
}
