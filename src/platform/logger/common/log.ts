import path from "path";

export const getLogConfig = function (dir: string) {
  // @ts-ignore
  const $CNF = process.type === "renderer" ? require("@electron/remote").getGlobal("$CNF") : global.$CNF;
  const DEV = $CNF.dev;
  const curNodeEnv = DEV;
  const BACK_LOG_DAYS = 4; //日志备份的天数
  //定义两个日志存量，根据5-7天的日志量来看需要多大，主要目的是减少读写消耗引起的性能问题
  const LOGS_MAX_SIZE = {
    NORMAL: "3M",
    SMALL: "1M",
  };
  const logConfig = {
    appenders: {
      mqtt: {
        type: "dateFile",
        filename: path.join(dir, "mqtt.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      httpError: {
        type: "stderr",
      },
      http: {
        type: "dateFile",
        filename: path.join(dir, "http.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      console: {
        type: "stdout",
      },
      // exception: {
      //   type: "stderr",
      // },

      debugger: {
        type: "dateFile",
        filename: path.join(dir, "debugger.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      exception: {
        type: "dateFile",
        filename: path.join(dir, "exception.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      /**sql出现过频繁打日志的情况，所以使用file type，可以限制日志文件的大小 */
      sql: {
        type: "file",
        filename: path.join(dir, "sql.log"),
        keepFileExt: true,
        maxLogSize: LOGS_MAX_SIZE.SMALL,
        backups: 3,
      },
      mail: {
        type: "file",
        filename: path.join(dir, "mail.log"),
        keepFileExt: true,
        maxLogSize: LOGS_MAX_SIZE.NORMAL,
        backups: 3,
      },
      file: {
        type: "dateFile",
        filename: path.join(dir, "fileDownload.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      fileV2: {
        type: "dateFile",
        filename: path.join(dir, "fileV2.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      downloadFile: {
        type: "dateFile",
        filename: path.join(dir, "downloadFile.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      uploadFile: {
        type: "dateFile",
        filename: path.join(dir, "uploadFile.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      bosszp: {
        type: "dateFile",
        filename: path.join(dir, "bossZP.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      hiMeeting: {
        type: "dateFile",
        filename: path.join(dir, "meeting.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      qtProgram: {
        type: "dateFile",
        filename: path.join(dir, "qtProgram.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      message: {
        type: "dateFile",
        filename: path.join(dir, "message.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: 4,
        compress: true,
      },
      login: {
        type: "dateFile",
        filename: path.join(dir, "login.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      jsbridge: {
        type: "dateFile",
        filename: path.join(dir, "jsbridge.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      calendar: {
        type: "dateFile",
        filename: path.join(dir, "calendar.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      contact: {
        type: "dateFile",
        filename: path.join(dir, "contact.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },

      conversation: {
        type: "dateFile",
        filename: path.join(dir, "conversation.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      // 个人信息 + 名片页面日志
      userCard: {
        type: "dateFile",
        filename: path.join(dir, "userCard.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      sharedProcess: {
        type: "dateFile",
        filename: path.join(dir, "sharedProcess.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      child_process: {
        type: "dateFile",
        alwaysIncludePattern: true,
        filename: path.join(dir, "child_process.log"),
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      // 升级日志
      update: {
        type: "file",
        filename: path.join(dir, "app-update.log"),
        keepFileExt: true,
        maxLogSize: LOGS_MAX_SIZE.SMALL,
        backups: 3,
      },
      // 消息推送
      notification: {
        type: "dateFile",
        filename: path.join(dir, "notification.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      // id加密 id-check
      idEncryption: {
        type: "dateFile",
        filename: path.join(dir, "idEncryption.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
      // 小程序
      miniapp: {
        type: "dateFile",
        filename: path.join(dir, "miniapp.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },

      // 进程信息
      processInfo: {
        type: "dateFile",
        filename: path.join(dir, "processInfo.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: 1, // 日志留一天即可
        compress: true,
      },

      /** BrowserV2相关的日志 */
      browserV2: {
        type: "dateFile",
        filename: path.join(dir, "browserV2.log"),
        alwaysIncludePattern: true,
        keepFileExt: true,
        numBackups: BACK_LOG_DAYS,
        compress: true,
      },
    },
    categories: {
      default: {
        appenders: ["debugger"],
        level: "info",
      },
      MQTT: {
        appenders: ["mqtt"],
        level: "info",
      },
      http: {
        appenders: ["http"],
        level: "info",
      },
      bosszp: {
        appenders: ["bosszp"],
        level: "info",
      },
      exception: {
        appenders: ["exception"],
        level: "error",
      },
      sql: {
        appenders: ["sql"],
        level: "info",
      },
      fileDownload: {
        appenders: ["file"],
        level: "info",
      },
      fileV2: {
        appenders: ["fileV2"],
        level: "info",
      },
      downloadFile: {
        appenders: ["downloadFile"],
        level: "info",
      },
      uploadFile: {
        appenders: ["uploadFile"],
        level: "info",
      },
      hiMeeting: {
        appenders: ["hiMeeting"],
        level: "info",
      },
      qtProgram: {
        appenders: ["qtProgram"],
        level: "info",
      },
      message: {
        appenders: ["message"],
        level: "info",
      },
      login: {
        appenders: ["login"],
        level: "info",
      },
      jsbridge: {
        appenders: ["jsbridge"],
        level: "info",
      },
      mail: {
        appenders: ["mail"],
        level: "info",
      },
      calendar: {
        appenders: ["calendar"],
        level: "info",
      },
      contact: {
        appenders: ["contact"],
        level: "info",
      },
      conversation: {
        appenders: ["conversation"],
        level: "info",
      },
      userCard: {
        appenders: ["userCard"],
        level: "info",
      },
      sharedProcess: {
        appenders: ["sharedProcess"],
        level: "error",
      },
      child_process: {
        appenders: ["child_process"],
        level: "all",
      },
      update: {
        appenders: ["update"],
        level: "info",
      },
      notification: {
        appenders: ["notification"],
        level: "info",
      },
      //id-check
      idEncryption: {
        appenders: ["idEncryption"],
        level: "info",
      },
      // 小程序
      miniapp: {
        appenders: ["miniapp"],
        level: "info",
      },

      // 进程信息
      processInfo: {
        appenders: ["processInfo"],
        level: "info",
      },
      browserV2: {
        appenders: ["browserV2"],
        level: "info",
      },
    },
  };
  return logConfig;
};

export type LogConfig = ReturnType<typeof getLogConfig>;
