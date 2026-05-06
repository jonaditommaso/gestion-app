import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, WORKSPACES_ID, MEMBERS_ID, NEXT_PUBLIC_APP_URL, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_APP_REDIRECT_URI } from '@/config';
import { Query } from 'node-appwrite';
import { getMember } from '@/features/workspaces/members/utils';
import { MemberRole } from '@/features/workspaces/members/types';
import { WorkspaceType } from '@/features/workspaces/types';
import { getActiveContext } from '@/features/team/server/utils';
import { planLimits } from '@/features/pricing/plan-limits';
import type { GitHubRepo, GitHubBranch, GitHubConnection, GitHubWorkspaceState, GitHubPR, GitHubCommit, GitHubCompare, GitHubCheckRun, GitHubDevData } from '../types';

type WorkspaceMetadata = Record<string, unknown> & {
    githubAccessToken?: string;
    githubConnection?: GitHubConnection;
    githubRepos?: GitHubRepo[];
};

const app = new Hono()

    // GET /github/auth-url/:workspaceId — returns URL to start OAuth flow
    .get(
        '/auth-url/:workspaceId',
        sessionMiddleware,
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            if (!GITHUB_APP_CLIENT_ID || !GITHUB_APP_REDIRECT_URI) {
                return ctx.json({ error: 'GitHub integration not configured' }, 500);
            }

            const state = JSON.stringify({ workspaceId, userId: user.$id });
            const params = new URLSearchParams({
                client_id: GITHUB_APP_CLIENT_ID,
                redirect_uri: GITHUB_APP_REDIRECT_URI,
                scope: 'repo read:org',
                state,
            });

            const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
            return ctx.json({ data: { url: authUrl } });
        }
    )

    // GET /github/callback — OAuth callback, exchanges code, stores token in workspace metadata
    .get(
        '/callback',
        async ctx => {
            const url = new URL(ctx.req.url);
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');

            if (!code || !state) {
                return ctx.redirect(`${NEXT_PUBLIC_APP_URL}?github_error=missing_params`);
            }

            let workspaceId: string;
            try {
                const parsed = JSON.parse(state) as { workspaceId: string; userId: string };
                workspaceId = parsed.workspaceId;
            } catch {
                return ctx.redirect(`${NEXT_PUBLIC_APP_URL}?github_error=invalid_state`);
            }

            if (!GITHUB_APP_CLIENT_ID || !GITHUB_APP_CLIENT_SECRET || !GITHUB_APP_REDIRECT_URI) {
                return ctx.redirect(`${NEXT_PUBLIC_APP_URL}?github_error=not_configured`);
            }

            // Exchange code for access token
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: GITHUB_APP_CLIENT_ID,
                    client_secret: GITHUB_APP_CLIENT_SECRET,
                    code,
                    redirect_uri: GITHUB_APP_REDIRECT_URI,
                }),
            });

            const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
            if (!tokenData.access_token) {
                return ctx.redirect(`${NEXT_PUBLIC_APP_URL}?github_error=token_exchange_failed`);
            }

            const accessToken = tokenData.access_token;

            // Fetch GitHub user info
            const userRes = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Gestionate' },
            });
            const githubUser = await userRes.json() as { login: string; type: string; avatar_url: string };

            // Create admin client to update workspace (no session available in callback)
            const { createAdminClient } = await import('@/lib/appwrite');
            const { databases } = await createAdminClient();

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let currentMeta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) {
                    currentMeta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
                }
            } catch { /* ignore */ }

            const connection: GitHubConnection = {
                login: githubUser.login,
                type: githubUser.type,
                avatarUrl: githubUser.avatar_url,
                connectedAt: new Date().toISOString(),
                connectedBy: '',
            };

            const updatedMeta: WorkspaceMetadata = {
                ...currentMeta,
                githubAccessToken: accessToken,
                githubConnection: connection,
                githubRepos: currentMeta.githubRepos ?? [],
            };

            await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
                metadata: JSON.stringify(updatedMeta),
            });

            return ctx.redirect(`${NEXT_PUBLIC_APP_URL}/workspaces/${workspaceId}?github_connected=true`);
        }
    )

    // GET /github/status/:workspaceId — returns connection status and repos (no token)
    .get(
        '/status/:workspaceId',
        sessionMiddleware,
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            const state: GitHubWorkspaceState = {
                connection: meta.githubConnection,
                repos: meta.githubRepos ?? [],
            };

            return ctx.json({ data: state });
        }
    )

    // POST /github/disconnect/:workspaceId — removes GitHub data from workspace metadata
    .post(
        '/disconnect/:workspaceId',
        sessionMiddleware,
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            const sanitizedMeta = Object.fromEntries(
                Object.entries(meta).filter(([k]) => k !== 'githubAccessToken' && k !== 'githubConnection' && k !== 'githubRepos')
            );
            await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
                metadata: JSON.stringify(sanitizedMeta),
            });

            return ctx.json({ data: { success: true } });
        }
    )

    // GET /github/available-repos/:workspaceId — lists repos from GitHub (not yet added)
    .get(
        '/available-repos/:workspaceId',
        sessionMiddleware,
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            if (!meta.githubAccessToken) {
                return ctx.json({ error: 'Not connected' }, 400);
            }

            const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
                headers: { Authorization: `Bearer ${meta.githubAccessToken}`, 'User-Agent': 'Gestionate' },
            });

            if (reposRes.status === 401) {
                return ctx.json({ error: 'GitHub token expired' }, 401);
            }

            const rawRepos = await reposRes.json() as Array<{
                id: number; name: string; owner: { login: string }; full_name: string;
                private: boolean; default_branch: string; description?: string; html_url: string;
            }>;

            const repos: GitHubRepo[] = rawRepos.map(r => ({
                id: r.id,
                name: r.name,
                owner: r.owner.login,
                fullName: r.full_name,
                private: r.private,
                defaultBranch: r.default_branch,
                description: r.description ?? undefined,
                url: r.html_url,
            }));

            return ctx.json({ data: repos });
        }
    )

    // POST /github/repos/:workspaceId — adds a repo to workspace
    .post(
        '/repos/:workspaceId',
        sessionMiddleware,
        zValidator('json', z.object({
            repo: z.object({
                id: z.number(),
                name: z.string(),
                owner: z.string(),
                fullName: z.string(),
                private: z.boolean(),
                defaultBranch: z.string(),
                description: z.string().optional(),
                url: z.string(),
            }),
        })),
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const body = ctx.req.valid('json') as { repo: GitHubRepo };
            const { repo } = body;

            // Check plan limit
            const orgContext = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!orgContext) return ctx.json({ error: 'No active organization' }, 400);

            const repoLimit = planLimits[orgContext.org.plan].githubRepos;

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            const currentRepos = meta.githubRepos ?? [];

            if (repoLimit !== -1 && currentRepos.length >= repoLimit) {
                return ctx.json({ error: 'Plan limit reached' }, 403);
            }

            if (currentRepos.find(r => r.id === repo.id)) {
                return ctx.json({ error: 'Repo already added' }, 400);
            }

            const updatedMeta: WorkspaceMetadata = {
                ...meta,
                githubRepos: [...currentRepos, repo],
            };

            await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
                metadata: JSON.stringify(updatedMeta),
            });

            return ctx.json({ data: repo });
        }
    )

    // DELETE /github/repos/:workspaceId/:repoId — removes a repo from workspace
    .delete(
        '/repos/:workspaceId/:repoId',
        sessionMiddleware,
        async ctx => {
            const { workspaceId, repoId } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            const updatedMeta: WorkspaceMetadata = {
                ...meta,
                githubRepos: (meta.githubRepos ?? []).filter(r => String(r.id) !== repoId),
            };

            await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
                metadata: JSON.stringify(updatedMeta),
            });

            return ctx.json({ data: { success: true } });
        }
    )

    // GET /github/branches/:workspaceId/:owner/:repo — fetches branches from GitHub API
    .get(
        '/branches/:workspaceId/:owner/:repo',
        sessionMiddleware,
        async ctx => {
            const { workspaceId, owner, repo } = ctx.req.param();
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);

            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            if (!meta.githubAccessToken) {
                return ctx.json({ error: 'Not connected' }, 400);
            }

            const branchesRes = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
                {
                    headers: { Authorization: `Bearer ${meta.githubAccessToken}`, 'User-Agent': 'Gestionate' },
                }
            );

            if (branchesRes.status === 401) {
                return ctx.json({ error: 'GitHub token expired' }, 401);
            }
            if (!branchesRes.ok) {
                return ctx.json({ error: 'Failed to fetch branches' }, 500);
            }

            const rawBranches = await branchesRes.json() as Array<{
                name: string; commit: { sha: string }; protected: boolean;
            }>;

            const branches: GitHubBranch[] = rawBranches.map(b => ({
                name: b.name,
                sha: b.commit.sha,
                protected: b.protected,
            }));

            return ctx.json({ data: branches });
        }
    )

    // GET /github/dev-data/:workspaceId/:owner/:repo?branch= — fetches PRs, commits, compare, checks
    .get(
        '/dev-data/:workspaceId/:owner/:repo',
        sessionMiddleware,
        zValidator('query', z.object({ branch: z.string() })),
        async ctx => {
            const { workspaceId, owner, repo } = ctx.req.param();
            const { branch } = ctx.req.valid('query');
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member) return ctx.json({ error: 'Unauthorized' }, 401);

            const workspace = await databases.getDocument<WorkspaceType>(DATABASE_ID, WORKSPACES_ID, workspaceId);
            let meta: WorkspaceMetadata = {};
            try {
                if (workspace.metadata) meta = JSON.parse(workspace.metadata) as WorkspaceMetadata;
            } catch { /* ignore */ }

            if (!meta.githubAccessToken) return ctx.json({ error: 'Not connected' }, 400);

            const headers = {
                Authorization: `Bearer ${meta.githubAccessToken}`,
                'User-Agent': 'Gestionate',
                Accept: 'application/vnd.github+json',
            };

            const base = `https://api.github.com/repos/${owner}/${repo}`;

            // Fetch all in parallel
            const [prsRes, commitsRes, compareRes, checksRes] = await Promise.allSettled([
                fetch(`${base}/pulls?head=${owner}:${encodeURIComponent(branch)}&state=all&per_page=10`, { headers }),
                fetch(`${base}/commits?sha=${encodeURIComponent(branch)}&per_page=5`, { headers }),
                fetch(`${base}/compare/${encodeURIComponent((meta.githubRepos?.find(r => r.name === repo && r.owner === owner)?.defaultBranch ?? 'main'))}...${encodeURIComponent(branch)}`, { headers }),
                fetch(`${base}/commits/${encodeURIComponent(branch)}/check-runs?per_page=10`, { headers }),
            ]);

            // Pull requests
            let pullRequests: GitHubPR[] = [];
            if (prsRes.status === 'fulfilled' && prsRes.value.ok) {
                const raw = await prsRes.value.json() as Array<{
                    number: number; title: string; state: string; merged_at: string | null;
                    user: { login: string; avatar_url: string }; created_at: string; updated_at: string;
                    html_url: string; draft: boolean;
                }>;
                pullRequests = raw.map(pr => ({
                    number: pr.number,
                    title: pr.title,
                    state: pr.state === 'open' ? 'open' : 'closed',
                    merged: !!pr.merged_at,
                    author: pr.user.login,
                    authorAvatar: pr.user.avatar_url,
                    createdAt: pr.created_at,
                    updatedAt: pr.updated_at,
                    url: pr.html_url,
                    draft: pr.draft,
                }));
            }

            // Recent commits
            let commits: GitHubCommit[] = [];
            if (commitsRes.status === 'fulfilled' && commitsRes.value.ok) {
                const raw = await commitsRes.value.json() as Array<{
                    sha: string; commit: { message: string; author: { name: string; date: string } };
                    author: { login: string; avatar_url: string } | null;
                    html_url: string;
                }>;
                commits = raw.map(c => ({
                    sha: c.sha.slice(0, 7),
                    message: c.commit.message.split('\n')[0],
                    author: c.author?.login ?? c.commit.author.name,
                    authorAvatar: c.author?.avatar_url ?? '',
                    date: c.commit.author.date,
                    url: c.html_url,
                }));
            }

            // Branch compare
            let compare: GitHubCompare | null = null;
            if (compareRes.status === 'fulfilled' && compareRes.value.ok) {
                const raw = await compareRes.value.json() as {
                    ahead_by: number; behind_by: number; status: string; base_commit: { sha: string };
                };
                const repoInfo = meta.githubRepos?.find(r => r.name === repo && r.owner === owner);
                compare = {
                    aheadBy: raw.ahead_by,
                    behindBy: raw.behind_by,
                    status: raw.status as GitHubCompare['status'],
                    base: repoInfo?.defaultBranch ?? 'main',
                };
            }

            // CI checks
            let checks: GitHubCheckRun[] = [];
            if (checksRes.status === 'fulfilled' && checksRes.value.ok) {
                const raw = await checksRes.value.json() as {
                    check_runs: Array<{
                        id: number; name: string; status: string; conclusion: string | null; html_url: string;
                    }>
                };
                checks = (raw.check_runs ?? []).map(c => ({
                    id: c.id,
                    name: c.name,
                    status: c.status as GitHubCheckRun['status'],
                    conclusion: c.conclusion as GitHubCheckRun['conclusion'],
                    url: c.html_url,
                }));
            }

            const data: GitHubDevData = { pullRequests, commits, compare, checks };
            return ctx.json({ data });
        }
    )

// Export the app — also needed to infer RPC types
export default app;

// Helper used by workspaces GET route to strip token from metadata before returning
export function stripGithubTokenFromMetadata(metadataString?: string): string | undefined {
    if (!metadataString) return metadataString;
    try {
        const meta = JSON.parse(metadataString) as WorkspaceMetadata;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { githubAccessToken: _token, ...rest } = meta;
        return JSON.stringify(rest);
    } catch {
        return metadataString;
    }
}

// Suppress unused import warning for MEMBERS_ID/Query used transitively
void [MEMBERS_ID, Query];
