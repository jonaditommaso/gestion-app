import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from "@/config";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";

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

  .get(
    '/',
    async (c) => {
      const userId = c.req.query('userId');
      const secret = c.req.query('secret');
      const plan = c.req.query('plan');
      const provider = c.req.query('provider');

      if (!userId || !secret) return c.json({ error: 'Missing fields' }, 400);

      const { account, users, teams } = await createAdminClient();
      const session = await account.createSession(userId, secret);

      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      const user = await users.get(userId);

      const isNewUser = !user.prefs?.role && !user.prefs?.plan;

      if (isNewUser) {
        const newTeam = await teams.create(
          ID.unique(),
          'not-provided-yet' // create company with generic name, the user doesnt know wigo behind scenes.
        )

        await teams.createMembership(
          newTeam.$id,
          ['OWNER'],
          user.email,
        );

        await teams.updatePrefs(newTeam.$id, { plan })

        await users.updatePrefs(userId, {
          role: "ADMIN",
          teamId: newTeam.$id,
          plan,
          // we don't set company at this time
        });
      }

      if (provider === 'google') {
        return c.redirect(`${NEXT_PUBLIC_APP_URL}/oauth/loading`);
      }

      return c.redirect(`${NEXT_PUBLIC_APP_URL}/`);
    }
  )

export default app;