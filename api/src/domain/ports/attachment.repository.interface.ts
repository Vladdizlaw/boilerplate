import { IAttachment } from '../interfaces/attachment.interface';
import { IBaseRepository } from './base-repository.interface';

export interface IAttachmentRepository extends IBaseRepository<IAttachment> {
  findBy(
    resource: string,
    user_id?: number,
    resource_id?: number,
  ): Promise<IAttachment[]>;
}
export abstract class AttachmentRepository implements IAttachmentRepository {
  abstract create(data: Partial<IAttachment>): Promise<IAttachment>;
  abstract update(
    id: number,
    data: Partial<IAttachment>,
  ): Promise<Partial<IAttachment>>;
  abstract delete(ids: number[]): Promise<void>;
  abstract find(): Promise<IAttachment[]>;
  abstract findMany(ids: number[], userId?: number): Promise<IAttachment[]>;
  abstract findOne(id: number): Promise<IAttachment>;
  abstract findBy(
    resource: string,
    user_id?: number,
    resource_id?: number,
  ): Promise<IAttachment[]>;
}
