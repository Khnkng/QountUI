// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  JAVA_BASE_URL: "https://dev-services.qount.io",
  NODE_BASE_URL: "https://dev-services.qount.io/BigHalfNode",
  BIGPAY_SERVICE_URL: "https://dev-services.qount.io",
  NOTIFICATIONS_URL: 'https://dev-services.qount.io:8081/socket.io',
  QOUNT_NOTIFICATIONS_URL: 'https://dev-services.qount.io:8081/qountnotifications',
  DWOLLA_SERVICE_URL: 'https://dev-services.qount.io',
  WORKFLOW_SERVICE_URL: 'https://dev-services.qount.io',
  DOCUMENT_SERVICE_URL: "https://dev-services.qount.io/DocumentServices",
  DOCHUB_SERVICE_URL: 'https://dev-services.qount.io/DocumentServices',
  ACTIVATION_LINK: "https://dev-oneapp.qount.io/login",
  WELCOME_URL: "https://dev-welcome.qount.io/oneapp/login",
  TAXES_URL: "https://dev-taxes.qount.io"
};
