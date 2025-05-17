import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createMongoAbility } from '@casl/ability';
import { Cache } from 'cache-manager';
import { AppAbility, AppActions, AppSubject, RawRule } from './types';
import { PRISMA_CLIENT, CASL_CACHE_MANAGER } from './casl.constants';

@Injectable()
export class AbilityFactory {
    constructor(
        @Inject(PRISMA_CLIENT) private prisma: PrismaClient,
        @Inject(CASL_CACHE_MANAGER) private cacheManager: Cache
    ) {}

    /**
     * Creates an ability instance for a user based on their role ID.
     * @param roleId The role ID of the user.
     * @returns A promise that resolves to an AppAbility instance.
     */

    async createForUser(roleId: number): Promise<AppAbility> {
        const cacheKey = `casl_rules_${roleId}`;

        // Try to get rules from cache
        console.log(`Checking cache for role (${roleId})`);
        let rules = await this.cacheManager.get<RawRule[]>(cacheKey);

        if (!rules) {
            console.log(`Cache miss for role (${roleId}), fetching from database`);

            const rawDbRows = await this.prisma.permission.findMany({
                where: { roleId },
            });

            rules = rawDbRows.map(row => ({
                action: row.action as AppActions,
                subject: row.subject as AppSubject,
                conditions: row.conditions ? JSON.parse(row.conditions as string) : undefined,
                inverted: row.inverted || undefined,
                reason: row.reason || undefined,
            }));

            // Cache the rules
            await this.cacheManager.set(cacheKey, rules);
            console.log(`Cached rules for role (${roleId})`);
        }

        console.log(`Creating ability for role (${roleId}) with rules:`, rules);

        return createMongoAbility<AppAbility>(rules);
    }

    async invalidateCache(roleId: number): Promise<void> {
        const cacheKey = `casl_rules_${roleId}`;
        await this.cacheManager.del(cacheKey);
        console.log(`Invalidated cache for role (${roleId})`);
    }
}