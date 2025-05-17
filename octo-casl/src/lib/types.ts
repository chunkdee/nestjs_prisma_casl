import { MongoAbility } from "@casl/ability";
import { Prisma } from "@prisma/client";

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppActions = keyof typeof Action;
//export type AppAbilityActions = Actions | `${Actions}Any` | `${Actions}Own`;
export type ModelName = Prisma.ModelName;
export type AppSubject = ModelName | 'all';
export type AppAbility = MongoAbility<[AppActions, AppSubject]>;

export interface RawRule {
  action: AppActions | AppActions[]
  subject: AppSubject | 'all'
  /** an array of fields to which user has (or not) access */
  fields?: string[]
  /** an object of conditions which restricts the rule scope */
  conditions?: any
  /** indicates whether rule allows or forbids something */
  inverted?: boolean
  /** message which explains why rule is forbidden */
  reason?: string
}

// Key for setting and getting metadata in the guard
export const CHECK_ABILITY = 'check_ability';

// Structure for the metadata stored by the decorator
export interface RequiredAbility {
  action: AppActions | AppActions[];
  subject: AppSubject | AppSubject[];
}