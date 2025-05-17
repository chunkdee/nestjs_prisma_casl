import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CHECK_ABILITY, RequiredAbility, AppAbility, AppSubject , AppActions} from './types';
//import { ABILITY_TOKEN } from './casl-ability.provider';
import { ABILITY_TOKEN,CLS_SERVICE,PRISMA_CLIENT } from './casl.constants'; // Import the token for the ability provider
import { ClsService } from 'nestjs-cls';
import { PrismaClient,User} from '@prisma/client';
import { AbilityFactory } from './casl-ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ABILITY_TOKEN) private ability: AppAbility, // Inject the request-scoped ability
    @Inject(CLS_SERVICE) private readonly cls: ClsService,
     private readonly abilityFactory: AbilityFactory, // Inject the ability factor
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // Get the required abilities from the route handler metadata
    const requiredAbilities = this.reflector.get<RequiredAbility[]>(
      CHECK_ABILITY,
      context.getHandler(),
    );

    // If no specific abilities are required for this route, allow access
    if (!requiredAbilities || requiredAbilities.length === 0) {
      return true;
    }

      const roleId = this.cls.get('roleId');
      const userId = this.cls.get('user.userId');
      const user: User = this.cls.get('user');
  
      const reqId = this.cls.getId();
      console.log('CASL: Extract User from CLS:', {roleId}); // Log the user object for debugging
      console.log('CASL: Extract reqId from reqId:', reqId);
      console.log('CASL: Extract reqId from userId:', userId);

      const appAbility2 = await this.abilityFactory.createForUser(user.roleId);
    // The guard checks ability.can(action, subjectType).
    // An in-controller check would be ability.can('update', articleInstance).

    for (const requiredAbility of requiredAbilities) {
      const action = requiredAbility.action as AppActions; // Cast to AppActions type
      const subject = requiredAbility.subject as AppSubject; // Cast to AppSubject type

      // Check if the user's ability instance allows the required action on the required subject type
     // if (!this.ability.can(action, subject)) {
      if (!appAbility2.can(action, subject)) {
        // If any required ability check fails, deny access
        throw new ForbiddenException('You do not have sufficient permissions to access this resource.');
      }
    }

    // If all required ability checks pass, allow access
    return true;
  }
}
