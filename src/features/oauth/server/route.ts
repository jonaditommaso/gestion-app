import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";

const app = new Hono()

  .get(
    '/callback',
    async (c) => {
      const url = new URL(c.req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const useRefresh = url.searchParams.get('use-refresh');
      const useAccessToken = url.searchParams.get('use-access-token')

      let invited;
      let dateStart;
      let title;
      let duration;
      let userId;

      if (state) {
        try {
          const parsed = JSON.parse(state);
          title = parsed.title;
          dateStart = parsed.dateStart;
          invited = parsed.invited;
          duration = parsed.duration;
          userId = parsed.userId;

        } catch (err) {
          console.error('Error parsing state', err);
        }
      } else {
        invited = url.searchParams.get('invited');
        dateStart = url.searchParams.get('dateStart');
        title = url.searchParams.get('title');
        duration = url.searchParams.get('duration');
        userId = url.searchParams.get('userId');
      }

      const queryParams = new URLSearchParams();
      queryParams.set("invited", invited);
      queryParams.set("dateStart", dateStart);
      queryParams.set("title", title);
      queryParams.set("duration", duration);
      queryParams.set("userId", userId);

      if (useAccessToken) {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}/api/meet?${queryParams.toString()}`);
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

        const tokenData = await tokenRes.json();

        if (!prefs?.google_refresh_token) {
          await users.updatePrefs(userId, {
            ...(prefs ?? {}),
            google_refresh_token: tokenData.refresh_token
          });
        }

        setCookie(c, 'google_access_token', tokenData.access_token, {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 // 1 hora (== tokenData.expires_in)
        });

        setCookie(c, 'google_access_token_exp', String(Date.now() + tokenData.expires_in * 1000), {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: tokenData.expires_in
        });

        return c.redirect(`${NEXT_PUBLIC_APP_URL}/api/meet?${queryParams.toString()}`);
      } catch (err) {
        console.error('❌ Error getting access token:', err);
        return c.redirect('/?error=token_failed');
      }
    }
  )

export default app;