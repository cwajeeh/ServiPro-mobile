import { parseRefreshTokenResponse } from '@/api/parseRefreshTokenResponse';

describe('parseRefreshTokenResponse', () => {
  it('parses nested data.tokens', () => {
    expect(
      parseRefreshTokenResponse({
        data: {
          tokens: { access_token: 'a', refresh_token: 'r' },
        },
      }),
    ).toEqual({ access_token: 'a', refresh_token: 'r' });
  });

  it('parses flat data.access_token', () => {
    expect(
      parseRefreshTokenResponse({
        data: { access_token: 'a', refresh_token: 'r' },
      }),
    ).toEqual({ access_token: 'a', refresh_token: 'r' });
  });

  it('parses top-level tokens', () => {
    expect(
      parseRefreshTokenResponse({
        access_token: 'a',
        refresh_token: 'r',
      }),
    ).toEqual({ access_token: 'a', refresh_token: 'r' });
  });

  it('returns null for invalid payloads', () => {
    expect(parseRefreshTokenResponse(null)).toBeNull();
    expect(parseRefreshTokenResponse({})).toBeNull();
    expect(parseRefreshTokenResponse({ data: {} })).toBeNull();
  });
});
