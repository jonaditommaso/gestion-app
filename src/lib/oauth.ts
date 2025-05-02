"use server";

import { createAdminClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithGithub( plan?: string) {
	const { account } = await createAdminClient();

    const headersList = await headers();
    const origin = headersList.get("origin");

	const queryParams = new URLSearchParams();
	if (plan) queryParams.set("plan", plan);

	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Github,
		`${origin}/oauth${plan ? `?${queryParams.toString()}` : ''}`,
		`${origin}/signup`,
	);

	return redirect(redirectUrl);
};

export async function signUpWithGoogle(plan?: string) {
	const { account } = await createAdminClient();

    const headersList = await headers();
    const origin = headersList.get("origin");

	const queryParams = new URLSearchParams();
	if (plan) queryParams.set("plan", plan);
	queryParams.set("provider", "google");

	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Google,
		`${origin}/oauth?${queryParams.toString()}`,
		`${origin}/signup`,
		[
			'openid',
			'email',
			'profile',
			'https://www.googleapis.com/auth/calendar.events'
		]
	);

	return redirect(redirectUrl);
};