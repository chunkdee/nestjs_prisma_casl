import  { CanActivate, Type } from "@nestjs/common";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {AbilityGuard,CheckAbilities} from  '@my-workspace/octo-casl'
import { applyDecorators, UseGuards } from "@nestjs/common"

interface AuthGuard {
  guards?: Type<CanActivate>[]
  unauthorizedResponse?: string
}

/**
 * It's a decorator that uses the JwtAuthGuard and PoliciesGuard guards, and returns an unauthorized
 * response if the user is not authenticated
 * @returns A function that returns a function
 */

export function Auth(options_?: AuthGuard) {
  const options = {
    guards: [JwtAuthGuard, AbilityGuard],
    ...options_,
  } satisfies AuthGuard

  return applyDecorators(
    UseGuards(...options.guards)
  )
}