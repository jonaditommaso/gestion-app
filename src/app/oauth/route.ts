import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

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
