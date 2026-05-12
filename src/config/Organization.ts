import { Images } from './Image';

export const INTERNET_BANKING_CONFIG = {
  ORG_DETAILS: {
    FULL_NAME: 'Mwalimu National Savings And Credit Co-operative Society Limited',
    SHORT_NAME: 'Mwalimu National Sacco Society Ltd',
    SLOGAN: 'Empowerment, Development, Security',
    PHONE: '+254 709 943 000',
    EMAIL: 'mwalimu@mwalimunational.coop',
    ADDRESS:
      'Mwalimu National Co-operative Plaza, Ground , 1st,2nd, 3rd and 4th Floors. Haile Selassie Avenue/Uhuru Highway - Nairobi, Kenya',
    SOCIAL_MEDIA_HANDLES: [],
    WEBSITE: 'https://www.mwalimunational.coop/',
    LOGO: {
      HEIGHT: '150',
      WIDTH: 'AUTO',
      // SRC: "data:image/png;base64,",
      SRC: Images.img_logo
    },
    BRANCHES: []
  },
  IB_DETAILS: {
    NAME: 'M-Siraji',
    TERMS_OF_SERVICE: 'https://www.kenpipesacco.com',
    PRIMARY_COLOR: '#49aa32',
    PRIMARY_COLOR_DARK: '103f91',
    PRIMARY_COLOR_LIGHT: '83aeef',
    PRIMARY_COLOR_ULTRA_LIGHT: 'e8f1ff',
    DARK_THEME_ENABLED: 'NO',
    USE_CUSTOM_FONT: 'YES',
    LOGO: {
      HEIGHT: '90',
      WIDTH: 'AUTO',
      // SRC: "data:image/png;base64,",
      SRC: Images.img_logo
    }
  },
  IB_CONFIGURATION_AND_SERVICES: {
    CONFIGURATION: {
      USERNAME: {
        '@HINT': 'Mobile Number',
        '@INPUT_TYPE': 'PHONE',
        '@LABEL': 'Username',
        '@LAYOUT_TYPE': 'VIRTUAL_KEYBOARD'
      },
      PASSWORD: {
        '@HINT': 'Mobile Banking PIN',
        '@INPUT_TYPE': 'TEXT',
        '@LABEL': 'Mobile Banking PIN',
        '@LAYOUT_TYPE': 'VIRTUAL_KEYBOARD'
      },
      LOGIN: {
        '@OTP_VERIFICATION': 'ACTIVE'
      },
      ONE_TIME_PASSWORD: {
        '@LOGIN_LENGTH': '6',
        '@LOGIN_TTL': '300',
        '@OTP_ID_LENGTH': '10',
        '@OTP_ID_REGEX': '(\\w+)\\n',
        '@OTP_VALUE_REGEX': '(\\d+)',
        '@SENDER_ID': 'Siraji',
        '@TRANSACTIONAL_LENGTH': '6',
        '@TRANSACTIONAL_TTL': '300'
      },
      WITHDRAW_TO_OTHER_NUMBER: {
        '@STATUS': 'ACTIVE'
      },
      MESSAGING: {
        '@STATUS': 'INACTIVE'
      },
      IOS_APP_ID: '12345678',
      SPINNER: {
        '@STYLE': 'POP_UP'
      }
    },
    SERVICES: []
  }
};
