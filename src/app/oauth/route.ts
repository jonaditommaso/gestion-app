import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if(!userId || !secret) return new NextResponse('Missing fields', { status: 400 })

    const { account, users } = await createAdminClient();
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
        await users.updatePrefs(userId, {
            role: "CREATOR",
            plan: "FREE",
        });
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
