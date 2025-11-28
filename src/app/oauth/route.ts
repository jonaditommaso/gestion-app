import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { IMAGES_BUCKET_ID } from "@/config";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");
    const plan = request.nextUrl.searchParams.get("plan");
    const provider = request.nextUrl.searchParams.get("provider");

    if (!userId || !secret) return new NextResponse('Missing fields', { status: 400 })

    const { account, users, teams, storage } = await createAdminClient();
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

        // Intentar obtener y guardar la foto de perfil del provider OAuth
        let profileImageId: string | undefined;

        if (provider === 'google' || provider === 'github') {
            try {
                // Obtener la URL de la foto según el provider
                let photoURL: string | null = null;

                if (provider === 'google') {
                    // Google incluye la foto en el objeto user de Appwrite
                    // Está disponible en user.prefs o podemos obtenerla de la API de Google
                    const sessions = await account.listSessions();
                    const currentSession = sessions.sessions.find(s => s.$id === session.$id);

                    if (currentSession?.providerAccessToken) {
                        const googleUserInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: {
                                'Authorization': `Bearer ${currentSession.providerAccessToken}`
                            }
                        });

                        if (googleUserInfo.ok) {
                            const data = await googleUserInfo.json();
                            photoURL = data.picture;
                        }
                    }
                } else if (provider === 'github') {
                    // GitHub proporciona avatar_url directamente
                    const sessions = await account.listSessions();
                    const currentSession = sessions.sessions.find(s => s.$id === session.$id);

                    if (currentSession?.providerAccessToken) {
                        const githubUserInfo = await fetch('https://api.github.com/user', {
                            headers: {
                                'Authorization': `Bearer ${currentSession.providerAccessToken}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });

                        if (githubUserInfo.ok) {
                            const data = await githubUserInfo.json();
                            photoURL = data.avatar_url;
                        }
                    }
                }

                // Si obtuvimos una URL, descargar y subir la imagen
                if (photoURL) {
                    const imageResponse = await fetch(photoURL);

                    if (imageResponse.ok) {
                        const imageBuffer = await imageResponse.arrayBuffer();
                        const imageBlob = new Blob([imageBuffer], {
                            type: imageResponse.headers.get('content-type') || 'image/jpeg'
                        });

                        // Crear un File object desde el Blob
                        const file = new File(
                            [imageBlob],
                            `${userId}-profile.jpg`,
                            { type: imageBlob.type }
                        );

                        // Subir a Appwrite Storage
                        const uploadedFile = await storage.createFile(
                            IMAGES_BUCKET_ID,
                            ID.unique(),
                            file
                        );

                        profileImageId = uploadedFile.$id;
                    }
                }
            } catch (error) {
                console.error('Error al obtener/guardar foto de perfil de OAuth:', error);
                // Continuar sin la foto si falla
            }
        }

        await users.updatePrefs(userId, {
            role: "ADMIN",
            teamId: newTeam.$id,
            plan,
            ...(profileImageId && { image: profileImageId }),
            // we don't set company at this time
        });
    }

    if (provider === 'google') {
        return NextResponse.redirect(`${request.nextUrl.origin}/oauth/loading`);
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
