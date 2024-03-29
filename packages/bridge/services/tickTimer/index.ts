export type Params = { [key: string]: any };

export interface ITickTimerService {
  /**
   * spm 埋点方法
   * @param {string} uuid
   * @param {Params} params
   */
  spm(uuid: string, params?: Params): Promise<any>;
}
