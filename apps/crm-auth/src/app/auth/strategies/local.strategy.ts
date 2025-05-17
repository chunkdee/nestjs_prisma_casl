import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService,
             @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
     //Reset the cache for the user
        const roleId = user.roleId;
        const cacheKey = `casl_rules_${roleId}`;
        await this.cacheManager.del(cacheKey);
        console.log(`User ${user.email} authenticated, cache invalidated for role (${roleId})`);

    return user;
  }
}
