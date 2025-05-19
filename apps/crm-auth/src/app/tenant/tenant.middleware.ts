import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenantId from the "x-tenant-id" header (or from query params as a fallback)
    const tenantId = req.headers['x-tenant-id'] || req.query.tenant;
    if (tenantId && typeof tenantId === 'string') {
      this.cls.set('tenantId', tenantId);  
      
    }
   
    next();
  }
}