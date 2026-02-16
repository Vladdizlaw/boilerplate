import { IAttachment } from './attachment.interface';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface IUser {
  id: number;
  email: string;
  password_hash?: string;
  role: 'ADMIN' | 'USER';
  provider?: string;
  provider_id?: string;
  user_agreements?: IUserAgreements;
  user_confirmations?: IUserConfirmations;
  profile?: IUserProfile;
  attachments?: IAttachment[] | [];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IUserProfile {
  id?: number;
  user_id: number;
  company_name: string;
  first_name?: string;
  phone?: string;
  last_name?: string;
}

export interface IUserAgreements {
  id: number;
  user_id: number;
  terms_and_conditions: boolean;
  updates_and_promotions?: boolean;
}
export interface IUserConfirmations {
  id: number;
  user_id: number;
  email: boolean;
  phone?: boolean;
}
