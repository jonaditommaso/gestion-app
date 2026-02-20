import { Account, AppwriteException, AuthenticationFactor, Client, ID, Query, Users } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";

async function fetchProviderPhotoURL(
    userId: string,
    provider: string,
    users: Users,
): Promise<string | undefined> {
    try {
        const identities = await users.listIdentities([Query.equal('userId', userId)]);
        const identity = identities.identities.find(i => i.provider === provider);
        const accessToken = identity?.providerAccessToken;

        if (!accessToken) return undefined;

        if (provider === 'google') {
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                return data.picture ?? undefined;
            }
        } else if (provider === 'github') {
            const res = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                return data.avatar_url ?? undefined;
            }
        }

        return undefined;
    } catch {
        return undefined;
    }
}

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");
    const plan = request.nextUrl.searchParams.get("plan");
    const provider = request.nextUrl.searchParams.get("provider");

    if (!userId || !secret) return new NextResponse('Missing fields', { status: 400 })

    const { account, users, teams } = await createAdminClient();
    const session = await account.createSession(userId, secret);
    const isSecure = process.env.NODE_ENV === 'production';

    const createRedirectResponse = (pathname: string, mfaToken?: string) => {
        const response = NextResponse.redirect(`${request.nextUrl.origin}${pathname}`);

        response.cookies.set(AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: isSecure,
            maxAge: 60 * 60 * 24 * 30,
        });

        if (mfaToken) {
            response.cookies.set('mfa_token', mfaToken, {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: isSecure,
                maxAge: 60 * 10,
            });
        }

        return response;
    };

    const sessionClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setSession(session.secret);

    const sessionAccount = new Account(sessionClient);

    try {
        const current = await sessionAccount.get();

        if (current.mfa === true) {
            const challenge = await sessionAccount.createMfaChallenge(AuthenticationFactor.Totp);
            const token = crypto.randomUUID();

            return createRedirectResponse(`/mfa?token=${token}&challengeId=${challenge.$id}`, token);
        }
    } catch (error) {
        if (error instanceof AppwriteException && error.type === 'user_more_factors_required') {
            const challenge = await sessionAccount.createMfaChallenge(AuthenticationFactor.Totp);
            const token = crypto.randomUUID();

            return createRedirectResponse(`/mfa?token=${token}&challengeId=${challenge.$id}`, token);
        }

        throw error;
    }

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

        let profileImageId: string | undefined;

        if (provider === 'google' || provider === 'github') {
            profileImageId = await fetchProviderPhotoURL(userId, provider, users);
        }

        await users.updatePrefs(userId, {
            role: "ADMIN",
            teamId: newTeam.$id,
            plan,
            ...(profileImageId && { image: profileImageId }),
            // we don't set company at this time
        });
    }

    if (!isNewUser && !user.prefs?.image && (provider === 'google' || provider === 'github')) {
        const photoURL = await fetchProviderPhotoURL(userId, provider, users);

        if (photoURL) {
            await users.updatePrefs(userId, {
                ...(user.prefs ?? {}),
                image: photoURL,
            });
        }
    }

    if (provider === 'google') {
        return createRedirectResponse('/oauth/loading');
    }

    return createRedirectResponse('/');
}
