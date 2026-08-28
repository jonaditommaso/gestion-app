import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { redirect, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getCurrent } from '@/features/auth/queries';
import {
    BLOG_POST_ORDER,
    type BlogCategoryLabels,
    type BlogPostSlug,
    type BlogPostTranslations,
    buildBlogPosts,
} from '../blog-content';

export function generateStaticParams(): Array<{ slug: BlogPostSlug }> {
    return BLOG_POST_ORDER.map((slug) => ({ slug }));
}

export default async function BlogArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const user = await getCurrent();

    if (user) redirect('/');

    const { slug } = await params;
    const t = await getTranslations('landing.blog');
    const posts = buildBlogPosts({
        contents: t.raw('posts') as BlogPostTranslations,
        categoryLabels: t.raw('categories') as BlogCategoryLabels,
        author: t('author'),
    });

    const post = posts.find((currentPost) => currentPost.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <div className='min-h-screen bg-slate-50'>
            <div
                className='text-white'
                style={{
                    backgroundImage:
                        'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 38%), linear-gradient(135deg, #10273a 0%, #07111c 100%)',
                }}
            >
                <div className='mx-auto max-w-6xl px-6 pb-20 pt-20'>
                <Button asChild variant='ghost' className='mb-10 px-0 text-white hover:bg-transparent hover:text-slate-200'>
                    <Link href='/blog'>
                        <ArrowLeft className='h-4 w-4' />
                        {t('back-to-blog')}
                    </Link>
                </Button>

                <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end'>
                    <div className='space-y-6'>
                        <Badge variant='outline' className='w-fit border-white/20 bg-white/10 text-white'>
                            {post.categoryLabel}
                        </Badge>

                        <div>
                            <h1 className='max-w-4xl text-balance text-4xl font-bold leading-tight md:text-6xl'>
                                {post.title}
                            </h1>
                            <p className='mt-5 max-w-3xl text-lg leading-8 text-slate-200 md:text-xl'>
                                {post.excerpt}
                            </p>
                        </div>

                        <div className='flex flex-wrap items-center gap-4 text-sm text-slate-200'>
                            <span className='font-medium text-white'>{post.author}</span>
                            <span className='flex items-center gap-1'>
                                <Calendar className='h-4 w-4' />
                                {post.publishedAt}
                            </span>
                            <span className='flex items-center gap-1'>
                                <Clock className='h-4 w-4' />
                                {post.readTime}
                            </span>
                        </div>

                        <div className='flex flex-wrap gap-3'>
                            <Button asChild variant='secondary'>
                                <Link href={post.relatedHref}>
                                    {post.relatedLabel}
                                    <ArrowRight className='h-4 w-4' />
                                </Link>
                            </Button>

                            <Button asChild variant='ghost' className='border border-white/15 text-white hover:bg-white/10 hover:text-white'>
                                <Link href='/docs'>
                                    {t('open-docs')}
                                    <ArrowRight className='h-4 w-4' />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className='relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/10'>
                        <Image
                            src={post.image}
                            alt={post.coverAlt}
                            fill
                            className='object-cover object-center'
                        />
                    </div>
                </div>
                </div>
            </div>

            <div className='bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] py-10 md:py-14'>
                <div className='mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_320px]'>
                    <article className='space-y-8'>
                        <section className='rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                            <p className='text-xl leading-8 text-slate-700'>
                                {post.intro}
                            </p>
                        </section>

                        {post.sections.map((section) => (
                            <section key={section.title} className='rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                                <h2 className='text-2xl font-bold text-slate-900 md:text-3xl'>
                                    {section.title}
                                </h2>

                                <div className='mt-5 space-y-4'>
                                    {section.paragraphs.map((paragraph) => (
                                        <p key={paragraph} className='text-base leading-8 text-slate-700 md:text-lg'>
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}

                        <section className='rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl md:p-10'>
                            <p className='text-sm uppercase tracking-[0.24em] text-slate-300'>
                                {post.takeawaysTitle}
                            </p>

                            <div className='mt-6 space-y-4'>
                                {post.takeaways.map((takeaway) => (
                                    <div key={takeaway} className='flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
                                        <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-blue-300' />
                                        <p className='text-base leading-7 text-slate-100'>
                                            {takeaway}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>

                    <aside className='space-y-6 lg:sticky lg:top-24 lg:h-fit'>
                        <Card className='border-slate-200 bg-white shadow-sm'>
                            <div className='p-6'>
                                <p className='text-sm uppercase tracking-[0.24em] text-blue-700'>
                                    {t('overview-title')}
                                </p>
                                <h2 className='mt-3 text-2xl font-semibold text-slate-900'>
                                    {post.highlightsTitle}
                                </h2>

                                <div className='mt-6 space-y-3'>
                                    {post.highlights.map((highlight) => (
                                        <div key={highlight} className='flex items-start gap-3 rounded-2xl bg-slate-50 p-4'>
                                            <Sparkles className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                                            <p className='text-sm leading-7 text-slate-700'>
                                                {highlight}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className='border-0 bg-blue-950 text-white shadow-xl'>
                            <div className='p-6'>
                                <p className='text-sm uppercase tracking-[0.24em] text-blue-200'>
                                    {t('related-feature')}
                                </p>
                                <h2 className='mt-3 text-2xl font-semibold'>
                                    {t('docs-cta-title')}
                                </h2>
                                <p className='mt-3 text-sm leading-7 text-blue-100'>
                                    {t('docs-cta-description')}
                                </p>

                                <div className='mt-6 flex flex-col gap-3'>
                                    <Button asChild variant='secondary'>
                                        <Link href={post.relatedHref}>
                                            {post.relatedLabel}
                                            <ArrowRight className='h-4 w-4' />
                                        </Link>
                                    </Button>

                                    <Button asChild variant='ghost' className='border border-white/15 text-white hover:bg-white/10 hover:text-white'>
                                        <Link href='/docs'>
                                            {t('open-docs')}
                                            <ArrowRight className='h-4 w-4' />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}