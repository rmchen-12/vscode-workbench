import { Event } from 'base/common/event';

export interface IGeeParams {
  challenge: any;
  validate: any;
  seccode: any;
}

export interface ILoginInfoState {
  t: string;
  sk: string;
  expireTime: number;
  userId: string;
  comId: string;
}

export const enum AuthenticationState {
  /**
   * 应用还没有登录过
   */
  NONE,

  /**
   * 退出登录
   */
  LOGOUT,

  /**
   * 正在登录中
   */
  LOGINING,

  /**
   * 登录成功
   */
  SUCCESS,

  /**
   * 触发了安全认证
   */
  SAFE_CHECK,

  /**
   * 通过安全认证
   */
  PASS_SAFE_CHECK,

  /**
   * 登录失败
   */
  FAIL,
}

/**
 * 登录场景值
 * 1.新安装包，登录到页面加载完成
 * 2.覆盖安装包，登录到页面加载完成
 * 3.退出登录，登录到页面加载完成
 * 4.退出APP，登录到页面加载完成
 */
export enum SceneType {
  NEW = 1,
  COVER_INSTALL = 2,
  LOGOUT = 3,
  EXITAPP = 4,
}

export enum LOGIN_FAIL_MESSAGES {
  /** 自动登录失败 */
  AUTO_LOGIN_FAIL = '自动登录失败，请手动登录',
  /** 调起极验失败 */
  SAFE_CHECK_FAIL = '安全验证异常，请稍后重试',
  /** 极验 验证错误次数过多，请重新登录 */
  GEE_ERROR_COUNT_MORE = '验证错误次数过多，请重新登录',
  /** 验证出错，请重新验证 */
  CHECK_ERROR = '验证出错，请重新验证',
  /** 极验 停留时间过长，请重新验证*/
  GEE_ERROR_EXPIRE = '停留时间过长，请重新验证',
  /** 更新db出错 */
  DB_ERROR = '数据异常，请稍后重试',
  /** 网络异常 */
  NETWORK_ERROR = '网络异常，请稍后重试',
  /** 二维码登录取消 */
  SCAN_CANCEL = '二维码登录取消',
  /** 被踢提示 */
  KICK = '当前账号被踢下线',
  /** 登录过期提示 */
  LOGIN_TOKEN_EXPIRED = '登录信息过期',
  /** 未知错误 */
  UNKNOWN_ERROR = '登录异常，请重新登录',
  /** 数据同步失败 TODO */
  DATA_ERROR = '数据同步异常，请重新登录',

  IS_LOGINING = '正在登录中，请稍后重试',
  // 手机端踢出
  MOBILE_KICK = '你已退出Boss Hi',

  IS_LOGINOUTING = '正在退出登录，请稍后重试',
}

// 极验返回的json
export interface IGeeJson {
  success: 0 | 1;
  challenge: string;
  gt: string;
}

// 极验验证后的sdk数据
export interface ISdkData {
  challenge: string;
  validate: string;
  seccode: string;
  type: number;
}

// 极验验证后的sdk数据
export interface ISdkSecParams extends ISdkData {
  regionCode: string;
  phone: string;
}

// 极验返回的成功数据
export interface IGeeData {
  challenge: string;
  validate: string;
  el: Element;
  seccode: string;
  type: number;
}

// 登录方式
export enum E_LOGIN_WAY {
  /** 账号密码登录 */
  PHONE_WAY = 'phone',
  /** 扫码登录 */
  SCAN_WAY = 'scan',
}

// 区域码
export interface IAreaItem {
  regionCode: string;
  name: string;
  regex: string;
}

// 登出方式
export enum E_LOGOUT_WAY {
  /** 用户主动退登 */
  USER_ACTIVE = 'user active',
  /** 被踢 */
  KICK = 'kick',
  /** 登录信息过期 */
  TOKEN_EXPIRED = 'token expired',
  /** 发生错误 */
  ERROR = 'error',
  /** 安全验证 */
  CHECK_SAFE = 'check safe',
}

// 安全风险标识  0=安全，1=有风险不安全
export enum E_SAFE_STATUS {
  SAFE = 0,
  NOT_SAFE = 1,
}

// 登录二维码状态
export enum E_QR_STATUS {
  SUCCESS = 0, // 请求成功
  PENDING = 1, // 请求中
  REFRESH = 2, // 请求中
  EXPIRE = 3, // 过期
  FAIL = 4, // 请求失败
}

// 二维码接口错误code
export enum E_QR_ERROR {
  ENCODE_ERROR = 1501, // 二维码编码格式错误
  ENCODE_EXIST = 1502, // 编码已存在
  EXPIRE = 1503, // 二维码已过期
  TYPE_ERROR = 1504, // 二维码类型错误
  NO_EXIST = 1505, // 二维码内容不存在
  SEACH_EMPTY = 1506, // 二维码查询数据为空(等待用户扫码)
  NOT_SUPPORT = 1507, // 二维码登陆类型不支持
  STEP_ERROR = 1508, // 二维码登陆步骤错误
  CANCEL = 1509, // 二维码登陆取消
  AUTH_ERROR = 1510, // 认证错误，请联系管理员
}

// 扫码后暂存的部分用户信息
export interface IScanUserInfo {
  avatar: string;
  nickName: string;
  tinyAvatar: string;
  userName: string;
  qrCode?: string;
}

// 二维码信息
export interface IQrInfo {
  imgUrl: string;
  qrCode: string;
}

// 团队信息
export interface ICompanyInfo {
  adminUserId: string;
  comId: string;
  comName: string;
  hiAppId: string;
  logo: string;
  userName: string;
}

// 团队设置
export interface ICompanySetting {
  expiration: any;
  expirationType: number;
  replyText: string;
  replyType: number;
  showExpiration: number;
  signature: string;
  workStatus: string;
  workStatusId: number;
}

// 部门信息
export interface IDepartment {
  deptId: string;
  deptName: string;
  manage: number;
  namePy: string;
  show: number;
}

/** 用户信息 */
export interface IUserInfo {
  autoClock: number;
  avatar: string;
  tinyAvatar: string;
  companies: Array<ICompanyInfo>;
  companySetting: ICompanySetting;
  defaultComId: string;
  departments: Array<IDepartment>;
  email: string;
  employeeNo: string;
  gender: number;
  hi_t: string;
  money: number;
  nickName: string;
  notifyWx: number;
  phone: number;
  phoneScope: number;
  regionCode: number;
  safeInfo: any; // null
  shakeClock: number;
  sk: string;
  status: number;
  t: string;
  title: string;
  userId: string;
  userIdNum: number;
  userName: string;
  zhipinUser: {
    wt: string;
    phone: string;
  };

  currentCompany: any;
  name: string;
  hiAppId: string;
  entryDate: number;
  workDays: number;
  presenceByManual: boolean;
}

/** 安全验证信息 */
export interface ISafeInfo {
  platform: number; // 平台字段,3: pc
  safeMsg: string; // 风险原因
  safeId: string; // 风险唯一id
  safeToken: string; // 风险token
  status: E_SAFE_STATUS;
}

/** 登录信息 */
export interface ILoginInfo {
  userInfo: IUserInfo;
  funcViews: Array<any>;
  otherTeamsHasMessage: boolean;
  switchTeamFromPresence: boolean;
  presenceByManual: boolean;
  TTIBeginTime: number;
  shiningTypes: Array<{ label: string; value: number }>;
}

export interface ILoginParams {
  t: string;
  sk: string;
  loginWay: E_LOGIN_WAY;
}

export interface ILoginResponse {
  /** 登录是否成功 */
  isSuccess: boolean;
  /** 登录失败message */
  failMessage?: LOGIN_FAIL_MESSAGES;
}

export interface ILogoutParams {
  logoutWay: E_LOGOUT_WAY;
  /** 提示语 */
  tip?: string;
  /** mqtt断开连接原因 */
  endMqttReason?: string;
  /** 调用来源 */
  source?: string;
}

export interface ILogoutResponse {
  /** 登录是否成功 */
  isSuccess: boolean;
  /** 登录失败message */
  failMessage?: LOGIN_FAIL_MESSAGES;
}



export type ILoginStorageKey = 'loginInfoState' | 'autoLoginState' | 'geeParamsState';

export interface ICommonAuthenticationService {
  readonly _serviceBrand: undefined;

  /** 登录过程中 */
  readonly onWillLogin: Event<LoginEvent>;

  /** 退登过程中 */
  readonly onWillLogout: Event<LogoutEvent>;

  /** 登录信息变更回调 */
  readonly onLoginInfoChange: Event<[ILoginInfo, ILoginInfo]>;
  loginInfo: ILoginInfo;

  /** 登录状态变更回调 */
  readonly onAuthenticationStateChange: Event<AuthenticationState>;
  authenticationState: AuthenticationState;

  /** 登录 */
  login(params: ILoginParams): Promise<ILoginResponse>;

  /** 退出登录 */
  logout(params: ILogoutParams): Promise<ILogoutResponse>;

  /** 更新用户信息 */
  updateUserInfo(newUserInfo: IUserInfo): Promise<void>;

  /** 更新t票 */
  updateTAndSk({ t, sk }: { t: string; sk: string }): Promise<void>;

  /** 清空t票 */
  clearTAndSk(): Promise<void>;

  /** 更新功能权限列表 */
  updateFuncViews(funcViews: Array<any>): Promise<void>;

  /** 更新用户企业列表 */
  updateUserCompanies(companies: Array<any>): Promise<void>;

  /** 切换团队 */
  switchTeam(switchTeamFromPresence: boolean): Promise<void>;

  /** 手动切换出席 */
  presenceByManual(presenceByManual: boolean): Promise<void>;

  updateZhiPinInfo(status: any): Promise<void>;

  resetLogin(isNeedClearLoginInfo: boolean): Promise<void>;

  passCheck(fromRoute: string): Promise<void>;

  setTicketCookies(arg: { t: string; sk: string }): Promise<any>;

  getLoginStorageByKey(key: 'loginInfoState'): Promise<ILoginInfoState | undefined>;
  getLoginStorageByKey(key: 'autoLoginState'): Promise<boolean | undefined>;
  getLoginStorageByKey(key: 'geeParamsState'): Promise<Record<string, IGeeParams> | undefined>;
  getLoginStorageByKey(key: ILoginStorageKey): Promise<ILoginInfoState | boolean | Record<string, IGeeParams> | undefined>;

  setLoginStorageByKey(params: { key: 'loginInfoState'; value: ILoginInfoState }): Promise<void>;
  setLoginStorageByKey(params: { key: 'autoLoginState'; value: boolean }): Promise<void>;
  setLoginStorageByKey(params: { key: 'geeParamsState'; value: Record<string, IGeeParams> }): Promise<void>;
  setLoginStorageByKey(params: { key: ILoginStorageKey; value: ILoginInfoState | boolean | Record<string, IGeeParams> }): Promise<void>;

  removeLoginStorageByKey(key: ILoginStorageKey): Promise<void>;

  /** 登录完成上报埋点 */
  endLoginTracking(): Promise<void>;
}

export interface LoginEvent {
  /**
   * 登录方式
   */
  loginWay: E_LOGIN_WAY;

  /**
   * 登录前的监听事件，这里的事件可能是个长任务，比如处理db
   */
  join(promise: Promise<void>, id: string): void;
}

export interface LogoutEvent {
  /**
   * 退登方式
   */
  logoutWay: E_LOGOUT_WAY;

  /**
   * 退登前的监听事件，这里的事件可能是个长任务，比如关闭db
   */
  join(promise: Promise<void>, id: string): void;
}
