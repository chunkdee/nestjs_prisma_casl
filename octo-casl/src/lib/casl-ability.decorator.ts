import { SetMetadata } from '@nestjs/common';
import { CHECK_ABILITY, RequiredAbility } from './types';

// Custom decorator to set the required abilities metadata
export const CheckAbilities = (...requirements: RequiredAbility[]) =>
  SetMetadata(CHECK_ABILITY, requirements);