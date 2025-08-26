import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Lightbulb, Heart } from 'lucide-react';

export default async function AboutPage() {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-32"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-8 text-center max-w-5xl px-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                        </div>
                        <span className="text-blue-300 font-medium">About Gestionate</span>
                    </div>
                    <h1 className='text-7xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-5xl leading-tight'>
                        Empowering teams to work smarter, not harder
                    </h1>
                    <p className='text-2xl font-normal text-balance opacity-90 max-sm:text-xl max-w-4xl leading-relaxed'>
                        We&apos;re building the future of team collaboration and productivity management,
                        one integrated solution at a time.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-6xl mx-auto px-6 space-y-20">

                    {/* Our Story */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">Our Story</h2>
                        <div className="max-w-4xl mx-auto space-y-8">
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Founded in 2024, Gestionate emerged from a simple observation: teams were
                                juggling too many platforms to get work done. From project management to
                                billing, from inventory to team communication - the fragmentation was
                                slowing everyone down.
                            </p>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                We set out to build something different. A unified platform that brings
                                all the essential tools together without compromising on functionality
                                or user experience.
                            </p>
                        </div>
                    </section>

                    {/* Our Values */}
                    <section>
                        <h2 className="text-5xl font-bold text-slate-800 mb-16 text-center">Our Values</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-4">People First</h3>
                                    <p className="text-slate-600">We design for humans, not just users. Every feature considers the real people behind the screen.</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                                        <Target className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Focus</h3>
                                    <p className="text-slate-600">We eliminate distractions and complexity, helping teams focus on what truly matters.</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors">
                                        <Lightbulb className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Innovation</h3>
                                    <p className="text-slate-600">We constantly evolve, bringing fresh ideas and cutting-edge solutions to everyday problems.</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                                        <Heart className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Care</h3>
                                    <p className="text-slate-600">We care deeply about our users&apos; success and build relationships that go beyond software.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Our Mission */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">Our Mission</h2>
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <CardContent className="p-16">
                                <h3 className="text-3xl font-semibold mb-6">
                                    To democratize enterprise-level productivity tools
                                </h3>
                                <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed">
                                    We believe every team, regardless of size or budget, deserves access to
                                    powerful, integrated tools that help them achieve their goals efficiently
                                    and effectively.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Team Stats */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">Meet the Team</h2>
                        <div className="max-w-4xl mx-auto mb-16">
                            <p className="text-xl text-slate-600 leading-relaxed">
                                We are a diverse group of dreamers, builders, and problem-solvers united
                                by our passion for creating tools that make work more enjoyable.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    50+
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Team Members</h3>
                                <p className="text-lg text-slate-600">Across 12 countries</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    5+
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Years Experience</h3>
                                <p className="text-lg text-slate-600">Average per team member</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    24/7
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Support</h3>
                                <p className="text-lg text-slate-600">Always here to help</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
