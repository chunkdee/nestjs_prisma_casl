import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private cls: ClsService
  ) {
    super();
  }
    handleRequest(err: any, user: any) {
    console.log('JwtAuthGuard handleRequest', { err, user });
    // If there is an error or no user, throw an UnauthorizedException  
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
      //Extract user and save in cls
        this.cls.set('user', user);
      
     // Log the user object for debugging
        console.log('JWT : cls set up for user ', { user });



    return user;
  }
}
