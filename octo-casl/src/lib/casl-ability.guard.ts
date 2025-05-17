import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY, RequiredAbility, AppSubject , AppActions} from './types';
import { CLS_SERVICE } from './casl.constants'; // Import the token for the ability provider
import { ClsService } from 'nestjs-cls';
import { User} from '@prisma/client';
import { AbilityFactory } from './casl-ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
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

    //get current user from cls (request context)
      const user: User = this.cls.get('user');

   //create the ability instance for the user
    const appAbility = await this.abilityFactory.createForUser(user.roleId);
    
    
    // The guard checks ability.can(action, subjectType).
    // Iterate over the required abilities and check if the user has the required permissions
    for (const requiredAbility of requiredAbilities) {
      const action = requiredAbility.action as AppActions; // Cast to AppActions type
      const subject = requiredAbility.subject as AppSubject; // Cast to AppSubject type

      console.log('Checking ability:', action, subject);

      // Check if the user's ability instance allows the required action on the required subject type
     // if (!this.ability.can(action, subject)) {
      if (!appAbility.can(action, subject)) {
        // If any required ability check fails, deny access
        throw new ForbiddenException('You do not have sufficient permissions to access this resource.');
      }
    }

    // If all required ability checks pass, allow access
    return true;
  }
}
