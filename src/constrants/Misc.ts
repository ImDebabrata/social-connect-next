const APP_NAME = "Social Connect";
const SESSION_COOKIE = "session";
const LS_JWT_TOKEN='sessionJwtToken';
const API_RESPONSE_MESSAGE_KEY = "message" as const;
const PASSWORD_RESET_EXPIRY_MINUTES = 15;

const Misc = {
  APP_NAME,
  SESSION_COOKIE,
  API_RESPONSE_MESSAGE_KEY,
  LS_JWT_TOKEN,
  PASSWORD_RESET_EXPIRY_MINUTES
};
export default Misc;
