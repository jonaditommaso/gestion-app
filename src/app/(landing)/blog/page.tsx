import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import BlogIndexClient from './BlogIndexClient';
import {
    type BlogCategoryLabels,
    type BlogPostTranslations,
    buildBlogPosts,
} from './blog-content';

export default async function BlogPage() {
    const user = await getCurrent();

    if (user) redirect('/');

    const t = await getTranslations('landing.blog');
    const posts = buildBlogPosts({
        contents: t.raw('posts') as BlogPostTranslations,
        categoryLabels: t.raw('categories') as BlogCategoryLabels,
        author: t('author'),
    });

    return (
        <div>
            <BlogIndexClient posts={posts} />
            <LandingFooter />
        </div>
    );
}
