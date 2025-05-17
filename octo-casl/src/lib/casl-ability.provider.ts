import { Provider } from '@nestjs/common';
import { AbilityFactory } from './casl-ability.factory';
import { PrismaClient, User} from '@prisma/client';
import { AppAbility } from './types';
import { ABILITY_TOKEN,PRISMA_CLIENT,CLS_SERVICE } from './casl.constants'
import { ClsService } from 'nestjs-cls';



export const AbilityProvider: Provider<AppAbility> = {
  provide: ABILITY_TOKEN,
  inject: [
    CLS_SERVICE,
    PRISMA_CLIENT
  ],
  useFactory: async (
    cls: ClsService,
    prisma: PrismaClient  // Inject the PrismaClient
  ) => {
    const user:User = cls.get('user');
    console.log('CASL: Extract User from CLS:', user); // Log the user object for debugging
     
    if (!user) {
      console.warn('No user found on request, creating guest ability');
      return new AbilityFactory(prisma,cls).createForUser(9);
    }
    return new AbilityFactory(prisma,cls).createForUser(user.roleId);
  }
};