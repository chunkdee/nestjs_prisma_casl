import { Injectable } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { User, Prisma } from '@prisma/client';


@Injectable()
export class UsersService {
  constructor(private readonly tenantService: TenantService) {

  }
 

  async findOne(email: string): Promise<User | null> {

    // Get the tenant-specific Prisma client
    // and the current tenant ID
    const tenantPrismaCient = this.tenantService.getClient();
    const tenantId = this.tenantService.getCurrentTenantId();
   

    //Create a custom cache key based on tenantId and email
    //tenant:tenant_1:model:user:email:cee_gmail_com
    const customKey = tenantPrismaCient.getKey({ params: [{ tenant:tenantId},{ model: 'User' }, { email: email }] });
  
    return tenantPrismaCient.user.findUnique({
      where: { email },
      cache: {key: customKey}, // Custom TTL and cache key

    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {

    const tenantPrismaCient = this.tenantService.getClient();
    const tenantId = this.tenantService.getCurrentTenantId();
    // Note: For create operations, you might want to invalidate cache entries for 'user' if needed.
    return tenantPrismaCient.user.create({
      data,
      uncache: {  // Invalidate cache for 'user' model    //tenant:tenant_1:model:user:*
        uncacheKeys: [
           tenantPrismaCient.getKeyPattern({ params: [{ tenant:tenantId},{ model: 'User' }, { glob: '*' }]}), // Use glob for more complex patterns
          ],
         hasPattern: true, // Use pattern matching for invalidation
  },
    });
  }

  async findAll(): Promise<User[]> {
    const tenantPrismaCient = this.tenantService.getClient();
    const tenantId =  this.tenantService.getCurrentTenantId;
    // custom cache key for findAll
    const customKey = tenantPrismaCient.getKey({ params: [{ tenant:tenantId},{ model: 'User' },{op:'findAll'}] });
  
    return tenantPrismaCient.user.findMany({
      cache: { ttl: 60, key: customKey }, // Custom TTL and cache key    ;
    });
  }
}
