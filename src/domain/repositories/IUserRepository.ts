import { User } from '../entities/User';

export interface IUserRepository {
  create<T extends User>(user: T): Promise<T>;
  findByMobileNumber(mobileNumber: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string):Promise<User | null>
  update<T extends User>(id: string, user: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  existsByMobileNumber(mobileNumber: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  existsByOrganizationNumber(organizationNumber: string): Promise<boolean>;
}