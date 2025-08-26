import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Database, UserCheck, Globe, Bell } from 'lucide-react';

const PrivacyView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-20"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-6 text-center max-w-3xl mt-20 px-6">
                    <Badge variant="secondary" className="mb-4">Privacy Policy</Badge>
                    <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                        Your Privacy Matters
                    </h1>
                    <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-2xl'>
                        We are committed to protecting your privacy and being transparent about how we collect,
                        use, and protect your personal information.
                    </p>
                    <p className='text-lg opacity-75'>Last updated: January 2025</p>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-4xl mx-auto px-6 space-y-8">

                    {/* Introduction */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Our Commitment to Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                At Gestionate, we understand that your privacy is fundamental to your trust in our services.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                when you use our platform and services.
                            </p>
                            <p>
                                We are committed to being transparent about our data practices and giving you control
                                over your personal information. If you have any questions about this policy,
                                please contact us at privacy@gestionate.com.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Information We Collect */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Database className="w-5 h-5 text-green-600" />
                                Information We Collect
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Information You Provide</h4>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Account information (name, email address, password)</li>
                                    <li>Profile information and preferences</li>
                                    <li>Content you create, upload, or share through our services</li>
                                    <li>Communication with our support team</li>
                                    <li>Payment and billing information (processed by secure third-party providers)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Information We Collect Automatically</h4>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Usage data and analytics (features used, time spent, interactions)</li>
                                    <li>Device information (IP address, browser type, operating system)</li>
                                    <li>Cookies and similar tracking technologies</li>
                                    <li>Log files and technical data for service improvement</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How We Use Information */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Eye className="w-5 h-5 text-purple-600" />
                                How We Use Your Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process transactions and send related information</li>
                                <li>Send you technical notices, updates, and support messages</li>
                                <li>Respond to your comments, questions, and customer service requests</li>
                                <li>Monitor and analyze trends, usage, and activities</li>
                                <li>Personalize your experience and provide relevant content</li>
                                <li>Detect, investigate, and prevent fraudulent transactions and security issues</li>
                                <li>Comply with legal obligations and protect our rights</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Information Sharing */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Globe className="w-5 h-5 text-orange-600" />
                                Information Sharing and Disclosure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                We do not sell, trade, or rent your personal information to third parties.
                                We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>With your consent:</strong> We will share information when you explicitly agree</li>
                                <li><strong>Service providers:</strong> Trusted third parties who help us operate our services</li>
                                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
                                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                                <li><strong>Protection of rights:</strong> To protect our rights, privacy, safety, or property</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Data Security */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Lock className="w-5 h-5 text-red-600" />
                                Data Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                We implement appropriate technical and organizational security measures to protect
                                your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Our Security Measures Include:</h4>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Regular security assessments and updates</li>
                                    <li>Access controls and authentication systems</li>
                                    <li>Secure data centers with physical security measures</li>
                                    <li>Employee training on privacy and security practices</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Your Rights */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <UserCheck className="w-5 h-5 text-indigo-600" />
                                Your Privacy Rights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                                <li><strong>Rectification:</strong> Ask us to correct any inaccurate or incomplete information</li>
                                <li><strong>Erasure:</strong> Request deletion of your personal information under certain circumstances</li>
                                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                <li><strong>Restriction:</strong> Ask us to limit how we use your information</li>
                                <li><strong>Objection:</strong> Object to our use of your information for certain purposes</li>
                                <li><strong>Withdraw consent:</strong> Where we rely on consent, you can withdraw it at any time</li>
                            </ul>
                            <p>
                                To exercise these rights, please contact us at privacy@gestionate.com.
                                We will respond to your request within 30 days.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Cookies and Tracking */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Bell className="w-5 h-5 text-yellow-600" />
                                Cookies and Tracking Technologies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                We use cookies and similar tracking technologies to enhance your experience,
                                analyze usage patterns, and provide personalized content.
                            </p>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Types of Cookies We Use:</h4>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Essential cookies:</strong> Required for basic functionality</li>
                                    <li><strong>Performance cookies:</strong> Help us understand how you use our services</li>
                                    <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                                    <li><strong>Analytics cookies:</strong> Provide insights for service improvement</li>
                                </ul>
                            </div>
                            <p>
                                You can control cookies through your browser settings. However,
                                disabling certain cookies may affect the functionality of our services.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-xl font-semibold mb-4">Questions About Your Privacy?</h3>
                            <p className="opacity-90 mb-4">
                                If you have any questions about this Privacy Policy or our data practices,
                                please contact our Privacy Team.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold">Email: privacy@gestionate.com</p>
                                <p className="opacity-75 text-sm">
                                    We typically respond to privacy inquiries within 48 hours.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default PrivacyView;
