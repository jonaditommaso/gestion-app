import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";

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

export default app;