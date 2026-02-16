export enum ResourceEnum {
  COMPANY = 'COMPANY',
  USER = 'USER',
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  FINANCIAL_MODEL = 'FINANCIAL_MODEL',
  BUSINESS_STRUCTURE = 'BUSINESS_STRUCTURE',
  OTHER_DOCUMENTS = 'OTHER_DOCUMENTS',
  SHAREHOLDERS_LIST = 'SHAREHOLDERS_LIST',
  INVESTMENT_PROSPECTUS = 'INVESTMENT_PROSPECTUS',
  KNOWLEDGE_INTENSIVE_EVIDENCE = 'KNOWLEDGE_INTENSIVE_EVIDENCE',
}

export interface IAttachment {
  id: number;
  original_file_name: string;
  file_name: string;
  file_type: string;
  path: string;
  resource_id?: number | null;
  resource: ResourceEnum | string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateAttachmentDao {
  original_file_name: string;
  file_name: string;
  file_type: string;
  path: string;
  user_id: number;
  resource: ResourceEnum;
  resource_id?: number | null;
}
