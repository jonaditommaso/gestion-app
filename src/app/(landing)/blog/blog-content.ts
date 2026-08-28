export type BlogCategoryKey = 'operations' | 'automation' | 'finance' | 'sales' | 'team';

export const BLOG_POST_ORDER = [
    'one-place-for-operations',
    'ai-agent-with-context',
    'billing-operational-visibility',
    'sales-pipeline-that-keeps-moving',
    'permissions-that-scale',
] as const;

export type BlogPostSlug = (typeof BLOG_POST_ORDER)[number];

export interface BlogPostSection {
    title: string;
    paragraphs: string[];
}

export interface BlogPostContent {
    title: string;
    excerpt: string;
    publishedAt: string;
    readTime: string;
    coverAlt: string;
    intro: string;
    relatedLabel: string;
    highlightsTitle: string;
    highlights: string[];
    sections: BlogPostSection[];
    takeawaysTitle: string;
    takeaways: string[];
}

export interface BlogPost extends BlogPostContent {
    slug: BlogPostSlug;
    category: BlogCategoryKey;
    categoryLabel: string;
    author: string;
    image: string;
    relatedHref: string;
    featured?: boolean;
}

export type BlogPostTranslations = Record<BlogPostSlug, BlogPostContent>;
export type BlogCategoryLabels = Record<BlogCategoryKey, string>;

export const BLOG_POST_META: Record<BlogPostSlug, {
    category: BlogCategoryKey;
    image: string;
    relatedHref: string;
    featured?: boolean;
}> = {
    'one-place-for-operations': {
        category: 'operations',
        image: '/present-workspaces.png',
        relatedHref: '/products#workspaces',
        featured: true,
    },
    'ai-agent-with-context': {
        category: 'automation',
        image: '/chatbot-empty.png',
        relatedHref: '/products#chatbot',
    },
    'billing-operational-visibility': {
        category: 'finance',
        image: '/present-billing.png',
        relatedHref: '/products#billing',
    },
    'sales-pipeline-that-keeps-moving': {
        category: 'sales',
        image: '/sells-kanban.png',
        relatedHref: '/products#sells',
    },
    'permissions-that-scale': {
        category: 'team',
        image: '/gestionate-docs.png',
        relatedHref: '/docs',
    },
};

export function buildBlogPosts({
    contents,
    categoryLabels,
    author,
}: {
    contents: BlogPostTranslations;
    categoryLabels: BlogCategoryLabels;
    author: string;
}): BlogPost[] {
    return BLOG_POST_ORDER.map((slug) => {
        const meta = BLOG_POST_META[slug];
        const content = contents[slug];

        return {
            ...content,
            ...meta,
            slug,
            author,
            categoryLabel: categoryLabels[meta.category],
        };
    });
}