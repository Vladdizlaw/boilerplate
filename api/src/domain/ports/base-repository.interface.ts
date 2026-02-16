export interface IBaseRepository<T> {
  create(data: Partial<T> | Record<string, any>): Promise<Partial<T>>;
  update(id: number, data: T): Promise<Partial<T>>;
  find(params: any): Promise<T[]>;
  findOne(id: number): Promise<T>;
}
