import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, ArrowRight, Search, Bookmark, TrendingUp, PenTool } from 'lucide-react';
import Image from 'next/image';

const BlogView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    const featuredPost = {
        title: "The Future of Team Collaboration: Why All-in-One Platforms Are Winning",
        excerpt: "Discover how integrated platforms are revolutionizing team productivity and why scattered tools are becoming a thing of the past.",
        author: "Sarah Johnson",
        date: "January 15, 2025",
        readTime: "8 min read",
        category: "Productivity",
        image: "/present-workspaces.png"
    };

    const blogPosts = [
        {
            title: "5 Ways to Streamline Your Billing Process",
            excerpt: "Learn practical strategies to automate your invoicing and reduce payment delays.",
            author: "Michael Chen",
            date: "January 12, 2025",
            readTime: "5 min read",
            category: "Finance",
            trending: true
        },
        {
            title: "Building Better Teams: The Psychology of Remote Collaboration",
            excerpt: "Understanding how remote teams function and the tools that bring them together.",
            author: "Dr. Emily Rodriguez",
            date: "January 10, 2025",
            readTime: "7 min read",
            category: "Team Management"
        },
        {
            title: "Data Security in the Cloud: What Every Business Needs to Know",
            excerpt: "Essential security practices for protecting your business data in cloud-based platforms.",
            author: "Alex Thompson",
            date: "January 8, 2025",
            readTime: "6 min read",
            category: "Security"
        },
        {
            title: "From Startup to Scale: Managing Growth with the Right Tools",
            excerpt: "How choosing the right tools early can make or break your scaling journey.",
            author: "Jessica Wong",
            date: "January 5, 2025",
            readTime: "9 min read",
            category: "Business Growth",
            trending: true
        },
        {
            title: "The ROI of Integrated Business Platforms",
            excerpt: "Calculate the real cost savings of switching to an all-in-one business platform.",
            author: "David Martinez",
            date: "January 3, 2025",
            readTime: "4 min read",
            category: "Business Strategy"
        },
        {
            title: "Customer Success Stories: How Teams Are Transforming with Gestionate",
            excerpt: "Real stories from real teams who have revolutionized their workflows.",
            author: "Lisa Park",
            date: "January 1, 2025",
            readTime: "6 min read",
            category: "Case Studies"
        }
    ];

    const categories = ["All", "Productivity", "Finance", "Team Management", "Security", "Business Growth", "Business Strategy", "Case Studies"];

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-20"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-6 text-center max-w-4xl mt-20 px-6">
                    <div className="mb-8 flex justify-center">
                        <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                            <PenTool className="h-4 w-4 text-blue-400" />
                            <div className="text-sm font-medium text-blue-300">
                                Blog
                            </div>
                        </div>
                    </div>
                    <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                        Insights & Resources
                    </h1>
                    <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-3xl'>
                        Stay up-to-date with the latest trends in team collaboration, productivity tips,
                        and business insights from industry experts.
                    </p>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-md mt-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search articles..."
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-7xl mx-auto px-6">

                    {/* Featured Post */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-slate-800 mb-8">Featured Article</h2>
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="grid lg:grid-cols-2 gap-0">
                                <div className="relative h-64 lg:h-auto">
                                    <Image
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                                        {featuredPost.title}
                                    </h3>
                                    <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>{featuredPost.author}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {featuredPost.date}
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {featuredPost.readTime}
                                            </div>
                                        </div>
                                        <Button>
                                            Read More <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-12">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={category === "All" ? "default" : "outline"}
                                    size="sm"
                                    className="hover:scale-105 transition-transform"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post, index) => (
                            <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary">{post.category}</Badge>
                                        {post.trending && (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Trending</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl leading-tight group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span className="font-medium">{post.author}</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">{post.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Bookmark className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Read <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Newsletter Signup */}
                    <div className="mt-16">
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <CardContent className="p-12 text-center">
                                <h3 className="text-3xl font-bold mb-4">Stay in the Loop</h3>
                                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                                    Get the latest insights, tips, and updates delivered directly to your inbox.
                                    Join thousands of professionals who trust our content.
                                </p>
                                <div className="flex gap-4 max-w-md mx-auto">
                                    <Input
                                        placeholder="Enter your email"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                    />
                                    <Button variant="secondary" size="lg">
                                        Subscribe
                                    </Button>
                                </div>
                                <p className="text-sm opacity-75 mt-4">
                                    No spam, unsubscribe at any time.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default BlogView;
