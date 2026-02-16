import { IAttachment } from '../interfaces/attachment.interface';
import {
  IUser,
  IUserAgreements,
  IUserConfirmations,
  IUserProfile,
  UserRole,
} from '../interfaces/user.interface';
import { BaseEntity } from './base-entity.entity';

export class User extends BaseEntity implements IUser {
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  provider?: string;
  provider_id?: string;
  user_agreements: UserAgreements;
  user_confirmations: UserConfirmations;
  profile: UserProfile;
  attachments?: IAttachment[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class UserAgreements extends BaseEntity implements IUserAgreements {
  user_id: number;
  terms_and_conditions: boolean;
  updates_and_promotions?: boolean;
}

export class UserConfirmations
  extends BaseEntity
  implements IUserConfirmations
{
  user_id: number;
  email: boolean;
  phone?: boolean;
}

export class UserProfile extends BaseEntity implements IUserProfile {
  user_id: number;
  company_name: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}

export class CreateUserDao {
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  provider?: string;
  provider_id?: string;
  phone?: string;
  terms_and_conditions: boolean;
  updates_and_promotions?: boolean;
}

export class UpdateUserProfileDao implements IUserProfile {
  user_id: number;
  company_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}
