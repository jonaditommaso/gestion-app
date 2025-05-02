import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

const app = new Hono();

app.get(
  '/callback',
  async (c) => {
    const url = new URL(c.req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

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
    }

    if (!code) {
      return c.redirect('/');
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: 'http://localhost:3000/api/oauth/callback', // Debe coincidir con el que registraste
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();

      setCookie(c, 'google_access_token', tokenData.access_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 // 1 hora
      });

      const queryParams = new URLSearchParams();
      queryParams.set("invited", invited);
      queryParams.set("dateStart", dateStart);
      queryParams.set("title", title);
      queryParams.set("duration", duration);
      queryParams.set("userId", userId);

      return c.redirect(`http://localhost:3000/api/meet?${queryParams.toString()}`);
    } catch (err) {
      console.error('❌ Error getting access token:', err);
      return c.redirect('/?error=token_failed');
    }
  }
);

export default app;



export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");
    const plan = request.nextUrl.searchParams.get("plan");
    const provider = request.nextUrl.searchParams.get("provider");

    if(!userId || !secret) return new NextResponse('Missing fields', { status: 400 })

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
        return NextResponse.redirect(`${request.nextUrl.origin}/oauth/loading`);
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
