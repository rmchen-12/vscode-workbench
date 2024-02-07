export interface IAuthenticationService {
  login(arg: number): Promise<number>;
  getList(): Promise<any>;
}
