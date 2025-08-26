import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
// import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, FileText, Video, Users, Settings, BarChart3, MessageSquare, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';

const ProductDocsView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    const docSections = [
        {
            title: "Getting Started",
            icon: BookOpen,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            docs: [
                { title: "Quick Start Guide", type: "guide" },
                { title: "Setting Up Your First Workspace", type: "tutorial" },
                { title: "Inviting Team Members", type: "guide" },
                { title: "Understanding Permissions", type: "concept" }
            ]
        },
        {
            title: "Workspace Management",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50",
            docs: [
                { title: "Creating and Managing Workspaces", type: "guide" },
                { title: "Role-Based Access Control", type: "concept" },
                { title: "Team Collaboration Features", type: "tutorial" },
                { title: "Workspace Settings", type: "reference" }
            ]
        },
        {
            title: "Project & Records",
            icon: FileText,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            docs: [
                { title: "Managing Projects", type: "guide" },
                { title: "Record Templates", type: "tutorial" },
                { title: "Data Import/Export", type: "guide" },
                { title: "Custom Fields", type: "reference" }
            ]
        },
        {
            title: "Billing & Inventory",
            icon: CreditCard,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            docs: [
                { title: "Invoice Management", type: "guide" },
                { title: "Inventory Tracking", type: "tutorial" },
                { title: "Payment Processing", type: "guide" },
                { title: "Financial Reports", type: "reference" }
            ]
        },
        {
            title: "Analytics & Reports",
            icon: BarChart3,
            color: "text-red-600",
            bgColor: "bg-red-50",
            docs: [
                { title: "Dashboard Overview", type: "guide" },
                { title: "Custom Reports", type: "tutorial" },
                { title: "Data Visualization", type: "guide" },
                { title: "Export Options", type: "reference" }
            ]
        },
        {
            title: "Integrations & API",
            icon: Package,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            docs: [
                { title: "Available Integrations", type: "reference" },
                { title: "API Documentation", type: "reference" },
                { title: "Webhooks Setup", type: "tutorial" },
                { title: "Third-party Connections", type: "guide" }
            ]
        }
    ];

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-20"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-6 text-center max-w-4xl mt-20 px-6">
                    <Badge variant="secondary" className="mb-4">Documentation</Badge>
                    <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                        Product Documentation
                    </h1>
                    <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-3xl'>
                        Everything you need to know about using Gestionate effectively.
                        From quick start guides to advanced features.
                    </p>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-md mt-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search documentation..."
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-7xl mx-auto px-6">

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">Video Tutorials</h3>
                                <p className="text-slate-600 mb-4">Watch step-by-step guides to master Gestionate features</p>
                                <Button variant="outline">Watch Now</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">Community Forum</h3>
                                <p className="text-slate-600 mb-4">Connect with other users and get help from the community</p>
                                <Button variant="outline">Join Forum</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">API Reference</h3>
                                <p className="text-slate-600 mb-4">Technical documentation for developers and integrations</p>
                                <Button variant="outline">View API</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documentation Sections */}
                    <div className="space-y-12">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-slate-800 mb-4">Browse by Category</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Find exactly what you need with our organized documentation sections
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {docSections.map((section, index) => {
                                const IconComponent = section.icon;
                                return (
                                    <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                                <div className={`p-2 rounded-lg ${section.bgColor}`}>
                                                    <IconComponent className={`w-6 h-6 ${section.color}`} />
                                                </div>
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {section.docs.map((doc, docIndex) => (
                                                    <div key={docIndex} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-4 h-4 text-slate-400" />
                                                            <span className="text-slate-700 font-medium">{doc.title}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {doc.type}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t">
                                                <Button variant="ghost" className="w-full justify-center">
                                                    View All in {section.title}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-16">
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <CardContent className="p-12 text-center">
                                <h3 className="text-3xl font-bold mb-4">Still need help?</h3>
                                <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
                                    Our support team is here to help you succeed with Gestionate.
                                    Get personalized assistance when you need it.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Link href="/contact">
                                        <Button variant="secondary" size="lg">
                                            Contact Support
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                                        Schedule Demo
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default ProductDocsView;
