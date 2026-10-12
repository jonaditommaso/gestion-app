import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { verifySignedOAuthState } from "@/lib/oauth-state";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

type GoogleOAuthState = {
  provider: 'google';
  userId: string;
  invited?: string;
  dateStart?: string;
  title?: string;
  duration?: string;
  auth_only?: boolean;
  drive_auth_only?: boolean;
  gmail_auth_only?: boolean;
};

const GOOGLE_OAUTH_STATE_NONCE_COOKIE = 'google_oauth_state_nonce';
const isSecure = process.env.NODE_ENV === 'production';

const app = new Hono()

  .get(
    '/callback',
    async (c) => {
      const url = new URL(c.req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const useRefresh = url.searchParams.get('use-refresh');
      const useAccessToken = url.searchParams.get('use-access-token')

      if (!state) {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}?error=invalid_state`);
      }

      const expectedNonce = getCookie(c, GOOGLE_OAUTH_STATE_NONCE_COOKIE);
      if (!expectedNonce) {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}?error=invalid_state`);
      }

      const parsedState = verifySignedOAuthState<GoogleOAuthState>(state, expectedNonce);
      deleteCookie(c, GOOGLE_OAUTH_STATE_NONCE_COOKIE);

      if (!parsedState || parsedState.provider !== 'google' || typeof parsedState.userId !== 'string' || parsedState.userId.trim().length === 0) {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}?error=invalid_state`);
      }

      const invited = typeof parsedState.invited === 'string' ? parsedState.invited : '';
      const dateStart = typeof parsedState.dateStart === 'string' ? parsedState.dateStart : '';
      const title = typeof parsedState.title === 'string' ? parsedState.title : '';
      const duration = typeof parsedState.duration === 'string' ? parsedState.duration : '';
      const userId = parsedState.userId;
      const authOnly = parsedState.auth_only === true;
      const driveAuthOnly = parsedState.drive_auth_only === true;
      const gmailAuthOnly = parsedState.gmail_auth_only === true;
      const shouldCreateMeet = !authOnly && !driveAuthOnly && !gmailAuthOnly;

      if (shouldCreateMeet && (!invited || !dateStart || !title || !duration)) {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}?error=invalid_state`);
      }

      const params: Record<string, string> = {
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI!,
        grant_type: useRefresh ? 'refresh_token' : 'authorization_code',
      };

      const { users } = await createAdminClient();
      const prefs = await users.getPrefs(userId);

      if (useRefresh) {

        if (!prefs?.google_refresh_token) {
          console.error('No refresh token found');
          return c.redirect('/');
        }

        params.refresh_token = prefs?.google_refresh_token;

      } else {
        if (!code) {
          console.error('No authorization code provided');
          return c.redirect('/');
        }
        params.code = code;
      }


      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(params),
        });

        const tokenData = await tokenRes.json() as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };

        if (!tokenRes.ok || !tokenData.access_token || typeof tokenData.expires_in !== 'number') {
          return c.redirect('/?error=token_failed');
        }

        if (driveAuthOnly) {
          await users.updatePrefs(userId, {
            ...(prefs ?? {}),
            ...(tokenData.refresh_token ? { google_refresh_token: tokenData.refresh_token } : {}),
            google_drive_scope: true,
          });
        } else if (gmailAuthOnly) {
          await users.updatePrefs(userId, {
            ...(prefs ?? {}),
            ...(tokenData.refresh_token ? { google_refresh_token: tokenData.refresh_token } : {}),
            google_gmail_scope: true,
          });
        } else if (!prefs?.google_refresh_token || !prefs?.google_calendar_scope) {
          await users.updatePrefs(userId, {
            ...(prefs ?? {}),
            ...(tokenData.refresh_token ? { google_refresh_token: tokenData.refresh_token } : {}),
            google_calendar_scope: true,
          });
        }

        setCookie(c, 'google_access_token', tokenData.access_token, {
          path: '/',
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          maxAge: 60 * 60 // 1 hora (== tokenData.expires_in)
        });

        setCookie(c, 'google_access_token_exp', String(Date.now() + tokenData.expires_in * 1000), {
          path: '/',
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          maxAge: tokenData.expires_in
        });

        if (authOnly || driveAuthOnly || gmailAuthOnly) {
          return c.redirect(`${NEXT_PUBLIC_APP_URL}/oauth/close`);
        }

        if (shouldCreateMeet || useAccessToken) {
          return c.redirect(`${NEXT_PUBLIC_APP_URL}/api/meet?state=${encodeURIComponent(state)}`);
        }

        return c.redirect(`${NEXT_PUBLIC_APP_URL}/oauth/close`);
      } catch (err) {
        console.error('❌ Error getting access token:', err);
        return c.redirect('/?error=token_failed');
      }
    }
  )

export default app;