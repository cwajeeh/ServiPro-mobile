jest.mock('react-native-config', () => ({
  default: {
    API_URL: 'https://staging-api.servisca.co.uk',
    MEDIA_BASE_URL: 'https://servisca-app.s3.eu-west-2.amazonaws.com',
    SERVISCA_WEB_URL: 'https://www.servisca.co.uk',
    TERMS_URL: 'https://www.servisca.co.uk/terms',
    PRIVACY_URL: 'https://www.servisca.co.uk/privacy-policy',
    FAQ_URL: 'https://www.servisca.co.uk/help',
    SENTRY_DSN: '',
    USER_DELETE_ACCOUNT_PATH: '/user/account',
    USER_DELETE_ACCOUNT_METHOD: 'DELETE',
    GOOGLE_MAPS_API_KEY: '',
    GOOGLE_WEB_CLIENT_ID: '',
    GOOGLE_WEB_CLIENT_ID_FIREBASE: '',
    STRIPE_PUBLISHABLE_KEY: '',
  },
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  return { WebView: () => React.createElement('View') };
});

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  wrap: (App) => App,
}));
