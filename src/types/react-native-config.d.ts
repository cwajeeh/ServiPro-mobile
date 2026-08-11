declare module 'react-native-config' {
  interface NativeConfig {
    API_URL?: string;
    MEDIA_BASE_URL?: string;
    /** Public website origin for default legal URLs (e.g. https://www.servisca.co.uk). */
    SERVISCA_WEB_URL?: string;
    TERMS_URL?: string;
    PRIVACY_URL?: string;
    FAQ_URL?: string;
    SENTRY_DSN?: string;
    /** HTTP method for account deletion: `DELETE` (default) or `POST`. */
    USER_DELETE_ACCOUNT_METHOD?: string;
    /** API path for account deletion (default `/user/account`). */
    USER_DELETE_ACCOUNT_PATH?: string;
    GOOGLE_MAPS_API_KEY?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    /** Android: injected from google-services.json Web client when .env omits GOOGLE_WEB_CLIENT_ID. */
    GOOGLE_WEB_CLIENT_ID_FIREBASE?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
    /** If set, POST FCM token here after login. Omit if the API only accepts device_token on `/auth/login`. */
    USER_DEVICE_TOKEN_PATH?: string;
    PUSH_DEVICE_TOKEN_FIELD?: string;
    PUSH_DEVICE_TYPE_FIELD?: string;
  }

  const Config: NativeConfig;
  export default Config;
}
