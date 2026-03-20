export const config = {
  appName: import.meta.env.VITE_APP_NAME || "CareerDoc",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  region: import.meta.env.VITE_AWS_REGION || "eu-west-1",
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || ""
  }
};

export const isApiConfigured = Boolean(config.apiBaseUrl);
export const isCognitoConfigured = Boolean(
  config.cognito.userPoolId && config.cognito.userPoolClientId
);
