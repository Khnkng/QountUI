/**
 * Created by seshu on 07-03-2016.
 */

export const PATH = {
  NODE_SERVICE_URL: 'https://dev-services.qount.io/BigHalfNode',
  ACTIVATE_USER: '/activate?token=:token',
  NOTIFICATIONS_URL: 'https://dev-services.qount.io:8081/socket.io',
  QOUNT_NOTIFICATIONS_URL: 'https://dev-services.qount.io:8081/qountnotifications',
  NOTIFICATIONS_PATH: '/notify/socket.io',
  JAVA_SERVICE_URL: 'https://dev-services.qount.io',
  SIGNUP_SERVICE: '/signup',
  EMAIL_SERVICE:'/email',
  LOGIN_SERVICE: '/login',
  FORGOT_PASSWORD_SERVICE: '/forgotpassword',
  RESET_PASSWORD_SERVICE: '/resetpassword',
  NOTIFICATIONS_SERVICE: '/notifications',
  UNREAD_NOTIFICATIONS_SERVICE: '/unreadNotifications',
  NOTIFICATIONS_COUNT: '/user/:userId/notificationscount',
  USER_SERVICE: '/HalfService/user',
  USERS_SERVICE: '/users?q=:prefix',
  USERS: '/users/',
  ACTIVATION_LINK: 'https://dev-payments.qount.io',
  COMPANIES_SERVICE: '/HalfService/user/:id/companies'
};

export const TOAST_TYPE = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
  confirm: "confirm"
};

export const SOURCE_TYPE = {
  JAVA: 'java',
  NODE: 'node',
  BIG_PAY: 'bigpay',
  WORKFLOW: 'workflow',
  DOCHUB: 'dochub',
  DWOLLA: 'dwolla'
};

export enum PAGES {
  DASHBOARD = <any>'dashboard',
  COMPANIES = <any>'companies',
  VENDORS = <any>'vendors',
  WORKFLOW = <any>'workflow',
  CARD_REPOSITORY = <any>'cardRepository',
  NOTIFICATIONS = <any>'notifications',
  GROUPS = <any>'groups',
  REPORTS = <any>'reports',
};

//SHARE_HEADERS==notification, message, timeStamp
//commentHeaders=["Notification","Comment","Timestamp"];
//groupHeaders=["Notification","Group Name","Timestamp"];
//alertHeaders=["Notification","Alert Desc","Timestamp"];
export const NOTIFICATIONS = {
  SHARE_HEADERS:[{"name":"notification_text","displayName":"Notification","isSortable":false,"datatype":"string"},{"name":"notification_date","displayName":"Timestamp","isSortable":true,"datatype":"numeric","dataSortInitial":"descending"},{"name":"source_id","displayName":"Link","isSortable":false,"datatype":"string"},{"name":"notification_id","displayName":"notification_id","isSortable":false,"datatype":"string"}],
  COMMENT_HEADERS:[{"name":"notification_text","displayName":"Notification","isSortable":false,"datatype":"string"},{"name":"notification_date","displayName":"Timestamp","isSortable":true,"datatype":"numeric","dataSortInitial":"descending"},{"name":"source_id","displayName":"Link","isSortable":false,"datatype":"string"},{"name":"notification_id","displayName":"notification_id","isSortable":false,"datatype":"string"}],
  GROUP_HEADERS:[{"name":"notification_text","displayName":"Notification","isSortable":false,"datatype":"string"},{"name":"notification_date","displayName":"Timestamp","isSortable":true,"datatype":"numeric","dataSortInitial":"descending"},{"name":"source_id","displayName":"Link","isSortable":false,"datatype":"string"},{"name":"notification_id","displayName":"notification_id","isSortable":false,"datatype":"string"}],
  ALERT_HEADERS:[{"name":"notification_text","displayName":"Notification","isSortable":false,"datatype":"string"},{"name":"notification_date","displayName":"Timestamp","isSortable":true,"datatype":"numeric","dataSortInitial":"descending"},{"name":"source_id","displayName":"Link","isSortable":false,"datatype":"string"},{"name":"notification_id","displayName":"notification_id","isSortable":false,"datatype":"string"}]
};


export const GROUPS = {
  HEADERS:[
    {"name":"group_name","displayName":"Group Name","isSortable":true,"datatype":"string","dataHide":""},
    {"name":"user_id","displayName":"Group Owner","isSortable":false,"datatype":"string","dataHide":""},
    {"name":"creation_date","displayName":"Creation Date","isSortable":true,"datatype":"numeric","dataHide":"phone","dataSortInitial":"descending"},
    {"name":"members","displayName":"Members","isSortable":false,"datatype":"numeric","dataHide":"phone"}
  ]
};
