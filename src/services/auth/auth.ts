import { IAuthService } from './authService';

export class AuthService implements IAuthService {
  declare readonly _serviceBrand: undefined;

  private id: string;
  private nickName: string;
  private firstName: string;
  private lastName: string;

  constructor() {
    this.id = 'auth';
    this.nickName = 'ha';
    this.firstName = 'lucy';
    this.lastName = 'lee';
  }

  getUserInfo() {
    console.log('service id:', this.id);
    console.log(`${this.firstName} ${this.lastName}: ${this.nickName}`);
  }
}
