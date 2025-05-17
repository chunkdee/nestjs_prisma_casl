import { Inject, Injectable } from '@nestjs/common';
import { Permission, PrismaClient } from '@prisma/client';
import { createMongoAbility } from '@casl/ability';
import { AppAbility, AppActions, AppSubject, RawRule } from './types';
import { PRISMA_CLIENT,CLS_SERVICE } from './casl.constants';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AbilityFactory {
    constructor(@Inject(PRISMA_CLIENT) private prisma: PrismaClient,
    @Inject(CLS_SERVICE) private readonly cls: ClsService
) {}


    /**
     * Creates an ability instance for a user based on their role ID.
     * @param roleId The role ID of the user.
     * @returns A promise that resolves to an AppAbility instance.
     */ 


    async createForUser(roleId : number) : Promise<AppAbility> {
        // 1. Fetch the raw database rows for the user
    
        console.log('CASL FACTORY: Extract roleId from CLS:', roleId);
        const rawDbRows: Permission[] = await this.prisma.permission.findMany({
            where: {roleId: roleId},
        });
      
        // This converts the database column structure to the CASL rule object structure.
        const rules : RawRule[] = rawDbRows.map(row => ({
            action: row.action as AppActions,
            subject: row.subject as AppSubject, // Ensure subject is never null
            conditions: row.conditions ? JSON.parse(row.conditions as string) : undefined, // Parse conditions as MongoDB query
            inverted: row.inverted || undefined,
            reason: row.reason || undefined,
        }));

       console.log(`Formatted rules for (${roleId}):`, rules); // Log the final rules array

       
        // This creates the ability instance with the rules.
        // Note: createMongoAbility is a function from the CASL library that creates an ability instance.
        return createMongoAbility<AppAbility>(rules);
    }
}