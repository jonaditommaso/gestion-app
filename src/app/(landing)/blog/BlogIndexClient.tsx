'use client';

import { useDeferredValue, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Calendar, Clock, PenTool, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BlogCategoryKey, BlogPost } from './blog-content';

interface BlogIndexClientProps {
    posts: BlogPost[];
}

type BlogCategoryFilter = 'all' | BlogCategoryKey;

const BlogIndexClient = ({ posts }: BlogIndexClientProps) => {
    const t = useTranslations('landing.blog');
    const [searchValue, setSearchValue] = useState('');
    const [activeCategory, setActiveCategory] = useState<BlogCategoryFilter>('all');
    const deferredSearchValue = useDeferredValue(searchValue);
    const normalizedSearchValue = deferredSearchValue.trim().toLowerCase();

    const featuredPost = posts.find((post) => post.featured) ?? posts[0];
    const remainingPostsSource = featuredPost
        ? posts.filter((post) => post.slug !== featuredPost.slug)
        : posts;

    const categories = Array.from(
        new Map(remainingPostsSource.map((post) => [post.category, post.categoryLabel])).entries()
    );

    const filteredRemainingPosts = remainingPostsSource.filter((post) => {
        const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
        const searchableContent = [
            post.title,
            post.excerpt,
            post.intro,
            post.categoryLabel,
            ...post.highlights,
            ...post.takeaways,
            ...post.sections.flatMap((section) => [section.title, ...section.paragraphs]),
        ].join(' ').toLowerCase();
        const matchesSearch = normalizedSearchValue.length === 0 || searchableContent.includes(normalizedSearchValue);

        return matchesCategory && matchesSearch;
    });

    const clearFilters = () => {
        setSearchValue('');
        setActiveCategory('all');
    };

    return (
        <div className='flex min-h-screen flex-col'>
            <div
                className='w-full text-white'
                style={{
                    backgroundImage:
                        'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 34%), linear-gradient(135deg, #10273a 0%, #07111c 100%)',
                }}
            >
                <div className='mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24'>
                    <div className='mt-16 flex flex-col items-center gap-6 text-center'>
                        <div className='flex justify-center'>
                            <div className='flex items-center gap-x-3 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/15'>
                                <PenTool className='h-4 w-4 text-blue-300' />
                                <span className='text-sm font-medium text-blue-100'>
                                    {t('badge')}
                                </span>
                            </div>
                        </div>

                        <h1 className='max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl'>
                            {t('title')}
                        </h1>

                        <p className='max-w-3xl text-balance text-lg text-slate-200 md:text-xl'>
                            {t('description')}
                        </p>
                    </div>

                </div>
            </div>

            <div className='flex-1 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] py-16'>
                <div className='mx-auto flex max-w-7xl flex-col gap-10 px-6'>
                    {featuredPost ? (
                        <section className='space-y-6'>
                            <div className='flex items-center justify-between gap-4'>
                                <h2 className='text-3xl font-bold text-slate-900 md:text-4xl'>
                                    {t('featured-title')}
                                </h2>
                            </div>

                            <Card className='overflow-hidden border-0 bg-white shadow-xl'>
                                <div className='grid lg:grid-cols-[0.95fr_1.05fr]'>
                                    <div className='relative min-h-[340px] bg-slate-100'>
                                        <Image
                                            src={featuredPost.image}
                                            alt={featuredPost.coverAlt}
                                            fill
                                            className='object-cover object-center'
                                        />
                                    </div>

                                    <div className='flex flex-col justify-between gap-6 p-8 md:p-10'>
                                        <div className='space-y-5'>
                                            <Badge variant='secondary' className='w-fit'>
                                                {featuredPost.categoryLabel}
                                            </Badge>

                                            <div>
                                                <h3 className='text-3xl font-bold leading-tight text-slate-900 md:text-4xl'>
                                                    {featuredPost.title}
                                                </h3>
                                                <p className='mt-4 text-lg leading-8 text-slate-600'>
                                                    {featuredPost.excerpt}
                                                </p>
                                            </div>

                                            <p className='text-base leading-7 text-slate-600'>
                                                {featuredPost.intro}
                                            </p>
                                        </div>

                                        <div className='flex flex-col gap-5 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between'>
                                            <div className='flex flex-wrap items-center gap-4 text-sm text-slate-500'>
                                                <span className='font-medium text-slate-700'>{featuredPost.author}</span>
                                                <span className='flex items-center gap-1'>
                                                    <Calendar className='h-4 w-4' />
                                                    {featuredPost.publishedAt}
                                                </span>
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='h-4 w-4' />
                                                    {featuredPost.readTime}
                                                </span>
                                            </div>

                                            <Button asChild>
                                                <Link href={`/blog/${featuredPost.slug}`}>
                                                    {t('read-article')}
                                                    <ArrowRight className='h-4 w-4' />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>
                    ) : (
                        <Card className='border-dashed border-slate-300 bg-white/80 shadow-sm'>
                            <div className='flex flex-col items-center gap-4 px-6 py-14 text-center'>
                                <h2 className='text-2xl font-semibold text-slate-900'>
                                    {t('empty-title')}
                                </h2>
                                <p className='max-w-2xl text-slate-600'>
                                    {t('empty-description')}
                                </p>
                                <Button type='button' variant='outline' onClick={clearFilters}>
                                    {t('clear-filters')}
                                </Button>
                            </div>
                        </Card>
                    )}

                    <Card className='border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-6'>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                                <div>
                                    <p className='text-sm uppercase tracking-[0.24em] text-blue-700'>
                                        {t('featured-label')}
                                    </p>
                                    <p className='mt-2 text-sm text-slate-600'>
                                        {t('results-count', { count: filteredRemainingPosts.length })}
                                    </p>
                                </div>

                                <div className='relative w-full max-w-xl'>
                                    <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
                                    <Input
                                        value={searchValue}
                                        onChange={(event) => setSearchValue(event.target.value)}
                                        placeholder={t('search-placeholder')}
                                        className='h-12 border-slate-300 bg-white pl-12 text-slate-900 caret-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-300'
                                    />
                                </div>
                            </div>

                            <div className='flex flex-wrap items-center gap-3'>
                                <Button
                                    type='button'
                                    size='sm'
                                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                                    onClick={() => setActiveCategory('all')}
                                    className='rounded-full'
                                >
                                    {t('all')}
                                </Button>

                                {categories.map(([category, label]) => (
                                    <Button
                                        key={category}
                                        type='button'
                                        size='sm'
                                        variant={activeCategory === category ? 'default' : 'outline'}
                                        onClick={() => setActiveCategory(category)}
                                        className='rounded-full'
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {filteredRemainingPosts.length > 0 ? (
                        <section className='space-y-6'>
                            <h2 className='text-3xl font-bold text-slate-900 md:text-4xl'>
                                {t('more-articles')}
                            </h2>

                            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                {filteredRemainingPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className='group block h-fit'
                                    >
                                        <Card className='h-full overflow-hidden border-slate-200/80 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl'>
                                            <div className='relative h-52 bg-slate-100'>
                                                <Image
                                                    src={post.image}
                                                    alt={post.coverAlt}
                                                    fill
                                                    className='object-cover object-center'
                                                />
                                            </div>

                                            <div className='flex h-full flex-col gap-5 p-6'>
                                                <div className='space-y-4'>
                                                    <Badge variant='outline' className='w-fit'>
                                                        {post.categoryLabel}
                                                    </Badge>

                                                    <div>
                                                        <h3 className='text-xl font-semibold leading-tight text-slate-900'>
                                                            {post.title}
                                                        </h3>
                                                        <p className='mt-3 text-sm leading-7 text-slate-600'>
                                                            {post.excerpt}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='mt-auto space-y-4 border-t border-slate-200 pt-4'>
                                                    <div className='flex flex-wrap items-center gap-4 text-xs text-slate-500'>
                                                        <span className='font-medium text-slate-700'>{post.author}</span>
                                                        <span className='flex items-center gap-1'>
                                                            <Calendar className='h-3.5 w-3.5' />
                                                            {post.publishedAt}
                                                        </span>
                                                        <span className='flex items-center gap-1'>
                                                            <Clock className='h-3.5 w-3.5' />
                                                            {post.readTime}
                                                        </span>
                                                    </div>

                                                    <div className='inline-flex items-center gap-2 text-sm font-medium text-slate-900'>
                                                        {t('read-article')}
                                                        <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <Card className='border-dashed border-slate-300 bg-white/80 shadow-sm'>
                            <div className='flex flex-col items-center gap-4 px-6 py-14 text-center'>
                                <h2 className='text-2xl font-semibold text-slate-900'>
                                    {t('empty-title')}
                                </h2>
                                <p className='max-w-2xl text-slate-600'>
                                    {t('empty-description')}
                                </p>
                                <Button type='button' variant='outline' onClick={clearFilters}>
                                    {t('clear-filters')}
                                </Button>
                            </div>
                        </Card>
                    )}

                    <Card className='overflow-hidden border-0 bg-slate-900 text-white shadow-xl'>
                        <div className='grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10'>
                            <div>
                                <h2 className='text-3xl font-bold md:text-4xl'>
                                    {t('docs-cta-title')}
                                </h2>
                                <p className='mt-3 max-w-2xl text-base leading-7 text-slate-300'>
                                    {t('docs-cta-description')}
                                </p>
                            </div>

                            <div className='flex flex-col gap-3 sm:flex-row'>
                                <Button asChild variant='secondary'>
                                    <Link href='/docs'>
                                        {t('open-docs')}
                                        <ArrowRight className='h-4 w-4' />
                                    </Link>
                                </Button>

                                <Button asChild variant='ghost' className='border border-white/15 text-white hover:bg-white/10 hover:text-white'>
                                    <Link href='/products'>
                                        {t('open-products')}
                                        <ArrowRight className='h-4 w-4' />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BlogIndexClient;