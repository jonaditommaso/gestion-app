import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { zValidator } from '@hono/zod-validator';
import { birthdaySchema, tagsSchema } from "../schema";

const app = new Hono()

.get(
    '/',
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const { users, teams } = await createAdminClient();

        const { memberships } = await teams.listMemberships(user.prefs.teamId);

        const fullMembers = await Promise.all(
            memberships.map(async member => {
                const user = await users.get(member.userId)

                return {
                    ...user,
                    ...member // probably not needed, check it out. it seems user has all the data we need
                }
            })
        )

        return ctx.json({ data: fullMembers })
    }
)

.patch(
    '/tags',
    zValidator('json', tagsSchema),
    sessionMiddleware,
    async ctx => {
        // designed to work only with the current user.
        // todo changes to edit as admin
        const user = ctx.get('user');
        const { users } = await createAdminClient();

        const { tag } = ctx.req.valid('json');

        const currentUser = await users.get(user.$id);
        const currentTags = currentUser.prefs.tags
            ? currentUser.prefs.tags.split(',').map((tag: string) => tag.trim())
            : [];

        if (currentTags.includes(tag) || currentTags.length >= 3) {
            return ctx.json({ tags: currentTags.join(',') });
        }

        currentTags.push(tag);

        await users.updatePrefs(user.$id, {
            ...(user.prefs ?? {}),
            tags: currentTags.join(','),
        });

        return ctx.json({ tags: currentTags.join(',') });
    }
)

.patch(
    '/birthday',
    zValidator('json', birthdaySchema),
    sessionMiddleware,
    async ctx => {
        // designed to work only with the current user.
        // todo changes to edit as admin
        const user = ctx.get('user');
        const { users } = await createAdminClient();

        const { birthday } = ctx.req.valid('json');

        await users.updatePrefs(user.$id, {
            ...(user.prefs ?? {}),
            birthday: birthday,
        });

        return ctx.json({ birthday });
    }
)

export default app;