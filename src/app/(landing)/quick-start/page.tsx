import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Rocket,
    Users,
    Settings,
    BarChart3,
    CreditCard,
    MessageSquare,
    Clock,
    CheckCircle,
    ArrowRight,
    Play,
    BookOpen,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default async function QuickStartPage() {
    const user = await getCurrent();

    if(user) redirect('/');

    const quickStartSteps = [
        {
            step: 1,
            title: "Create Your Account",
            description: "Sign up in under 60 seconds and get access to all Gestionate features",
            time: "2 minutes",
            icon: Users,
            color: "blue",
            tasks: [
                "Sign up with email or Google",
                "Verify your email address",
                "Complete your profile setup"
            ]
        },
        {
            step: 2,
            title: "Set Up Your First Workspace",
            description: "Create your team workspace and invite members to start collaborating",
            time: "5 minutes",
            icon: Settings,
            color: "green",
            tasks: [
                "Name your workspace",
                "Invite team members",
                "Set basic permissions",
                "Choose your workspace settings"
            ]
        },
        {
            step: 3,
            title: "Create Your First Project",
            description: "Start managing your work with projects, tasks, and milestones",
            time: "10 minutes",
            icon: Rocket,
            color: "purple",
            tasks: [
                "Create a new project",
                "Add project description and goals",
                "Set up project milestones",
                "Add your first tasks"
            ]
        },
        {
            step: 4,
            title: "Configure Billing & Inventory",
            description: "Set up invoicing, payment methods, and inventory tracking",
            time: "15 minutes",
            icon: CreditCard,
            color: "orange",
            tasks: [
                "Add your company information",
                "Set up payment methods",
                "Create your first invoice template",
                "Add initial inventory items"
            ]
        }
    ];

    const quickActions = [
        {
            title: "Import Existing Data",
            description: "Migrate your data from other platforms",
            icon: BarChart3,
            time: "20 minutes",
            difficulty: "Intermediate"
        },
        {
            title: "Set Up Integrations",
            description: "Connect your favorite tools and services",
            icon: MessageSquare,
            time: "10 minutes",
            difficulty: "Easy"
        },
        {
            title: "Customize Your Dashboard",
            description: "Personalize your workspace for maximum productivity",
            icon: Settings,
            time: "15 minutes",
            difficulty: "Easy"
        }
    ];

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-32"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-8 text-center max-w-5xl px-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-green-300 font-medium">Quick Start Guide</span>
                    </div>
                    <h1 className='text-7xl font-bold text-balance bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent max-sm:text-5xl leading-tight'>
                        Get Started in Minutes
                    </h1>
                    <p className='text-2xl font-normal text-balance opacity-90 max-sm:text-xl max-w-4xl leading-relaxed'>
                        Follow our step-by-step guide to set up Gestionate and start boosting your team&apos;s productivity today.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700">
                            <Play className="w-5 h-5 mr-2" />
                            Start Now
                        </Button>
                        <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-800">
                            <BookOpen className="w-5 h-5 mr-2" />
                            View Full Docs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-6xl mx-auto px-6 space-y-16">

                    {/* Quick Stats */}
                    <section className="text-center">
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">30 Minutes</h3>
                                <p className="text-slate-600">Complete setup time</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">4 Steps</h3>
                                <p className="text-slate-600">To full productivity</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">100%</h3>
                                <p className="text-slate-600">Success rate</p>
                            </div>
                        </div>
                    </section>

                    {/* Step-by-Step Guide */}
                    <section>
                        <h2 className="text-5xl font-bold text-slate-800 mb-16 text-center">Step-by-Step Setup</h2>
                        <div className="space-y-8">
                            {quickStartSteps.map((step, index) => {
                                const IconComponent = step.icon;
                                const colorMap = {
                                    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
                                    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
                                    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
                                    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
                                };
                                const colors = colorMap[step.color as keyof typeof colorMap];

                                return (
                                    <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-start p-8 gap-6">
                                            <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                                <IconComponent className={`w-8 h-8 ${colors.text}`} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Badge variant="outline" className={`${colors.border} ${colors.text} border-2`}>
                                                        Step {step.step}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {step.time}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-800 mb-3">{step.title}</h3>
                                                <p className="text-lg text-slate-600 mb-6">{step.description}</p>
                                                <div className="space-y-2">
                                                    {step.tasks.map((task, taskIndex) => (
                                                        <div key={taskIndex} className="flex items-center gap-3">
                                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                            <span className="text-slate-700">{task}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button className="flex-shrink-0">
                                                Start Step {step.step}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-4xl font-bold text-slate-800 mb-12 text-center">Optional Quick Actions</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon;
                                return (
                                    <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                                        <CardHeader>
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                                                <IconComponent className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <CardTitle className="text-xl">{action.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-600 mb-4">{action.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Clock className="w-4 h-4" />
                                                    {action.time}
                                                </div>
                                                <Badge variant="outline">{action.difficulty}</Badge>
                                            </div>
                                            <Button variant="ghost" className="w-full mt-4 group-hover:bg-slate-100">
                                                Learn More
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Support Section */}
                    <section className="text-center">
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-blue-600 text-white">
                            <CardContent className="p-12">
                                <h3 className="text-3xl font-bold mb-4">Need Help Getting Started?</h3>
                                <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                                    Our support team is standing by to help you get the most out of Gestionate.
                                    Get personalized onboarding assistance.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Link href="/contact">
                                        <Button variant="secondary" size="lg">
                                            Contact Support
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-green-600">
                                        Schedule Onboarding Call
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
