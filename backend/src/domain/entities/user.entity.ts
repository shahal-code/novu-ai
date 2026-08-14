export class UserEntity {
  id: string;
  email?: string;
  passwordHash?: string;
  googleId?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
