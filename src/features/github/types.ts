export type GitHubRepo = {
    id: number;
    name: string;
    owner: string;
    fullName: string;
    private: boolean;
    defaultBranch: string;
    description?: string;
    url: string;
};

export type GitHubBranch = {
    name: string;
    sha: string;
    protected: boolean;
};

export type GitHubConnection = {
    login: string;
    type: string;
    avatarUrl: string;
    connectedAt: string;
    connectedBy: string;
};

export type GitHubWorkspaceState = {
    connection?: GitHubConnection;
    repos: GitHubRepo[];
};

export type GitHubPR = {
    number: number;
    title: string;
    state: 'open' | 'closed';
    merged: boolean;
    author: string;
    authorAvatar: string;
    createdAt: string;
    updatedAt: string;
    url: string;
    draft: boolean;
};

export type GitHubCommit = {
    sha: string;
    message: string;
    author: string;
    authorAvatar: string;
    date: string;
    url: string;
};

export type GitHubCompare = {
    aheadBy: number;
    behindBy: number;
    status: 'ahead' | 'behind' | 'diverged' | 'identical';
    base: string;
};

export type GitHubCheckRun = {
    id: number;
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
    url: string;
};

export type GitHubDevData = {
    pullRequests: GitHubPR[];
    commits: GitHubCommit[];
    compare: GitHubCompare | null;
    checks: GitHubCheckRun[];
};
