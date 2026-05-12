import moment from "moment";
import { CLIENT_CONF } from '@/getClientConf';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const FRIENDLY_DATE_FORMAT = 'DD MMM YYYY';
export const FRIENDLY_DATETIME_FORMAT = 'DD MMM YYYY HH:mm:ss';

export const getFriendlyDateTime = () => {
  return moment().format(FRIENDLY_DATETIME_FORMAT)
}

export const CHANGE_PASSWORD_REDIRECT_TIME_IN_SECONDS = 10;

export const API_URL: string = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/check-your-env';

export const PORTAL_COOKIE_ID = CLIENT_CONF.cookie_id
export const PORTAL_STORAGE_ID = CLIENT_CONF.storage_id


export const IDLE_TIMEOUT: number = CLIENT_CONF.idle_timeout_seconds;
export const IDLE_PROMPT_TIMEOUT: number = CLIENT_CONF.idle_prompt_timeout_seconds;
export const SESSION_TIMEOUT: number = CLIENT_CONF.session_timeout_seconds;
export const OTP_TTL_MINS: number = CLIENT_CONF.otp_ttl_mins;

export const ERROR_TIMEOUT = 10000;
export const SUCCESS_TIMEOUT = 1500;

export const MSW_DELAY = 1000;

export const DEFAULT_PAGE_COUNT = 5;

export const SKY_MCP_HASH_SALT = CLIENT_CONF.hash_salt
export const SKY_MCP_TRIPLE_DES_SECRET_KEY = CLIENT_CONF.triple_des_secret_key

CLIENT_CONF.secure_api_key





