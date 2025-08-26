import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
// import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Shield, AlertTriangle, Users } from 'lucide-react';

const TermsView = async () => {
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
                    <Badge variant="secondary" className="mb-4">Legal</Badge>
                    <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                        Terms of Service
                    </h1>
                    <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-2xl'>
                        Last updated: January 2025
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-4xl mx-auto px-6 space-y-8">

                    {/* Introduction */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <ScrollText className="w-5 h-5 text-blue-600" />
                                Welcome to Gestionate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                These Terms of Service (&quot;Terms&quot;) govern your use of Gestionate&apos;s services,
                                including our website, applications, and any related services (collectively, the &quot;Service&quot;)
                                operated by Gestionate (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
                            </p>
                            <p>
                                By accessing or using our Service, you agree to be bound by these Terms.
                                If you disagree with any part of these terms, then you may not access the Service.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Account Terms */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Users className="w-5 h-5 text-green-600" />
                                Account Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                <strong>Account Creation:</strong> You must provide accurate and complete information
                                when creating an account. You are responsible for maintaining the security of your account.
                            </p>
                            <p>
                                <strong>Eligibility:</strong> You must be at least 18 years old to use our Service.
                                By using our Service, you represent that you meet this age requirement.
                            </p>
                            <p>
                                <strong>Account Responsibility:</strong> You are responsible for all activities that
                                occur under your account and for maintaining the confidentiality of your password.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Acceptable Use */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Shield className="w-5 h-5 text-purple-600" />
                                Acceptable Use Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>You may not use our Service:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                                <li>To submit false or misleading information</li>
                                <li>To upload or transmit viruses or any other type of malicious code</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Service Availability */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                Service Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                <strong>Uptime:</strong> We strive to maintain 99.9% uptime for our Service,
                                but we cannot guarantee uninterrupted access.
                            </p>
                            <p>
                                <strong>Maintenance:</strong> We may temporarily suspend the Service for
                                maintenance, updates, or improvements. We will provide advance notice when possible.
                            </p>
                            <p>
                                <strong>Data Backup:</strong> While we maintain backups of your data,
                                you are responsible for maintaining your own backups of important information.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Payment Terms */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Payment and Billing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                <strong>Subscription Fees:</strong> Paid plans are billed in advance on a monthly
                                or annual basis and are non-refundable except as required by law.
                            </p>
                            <p>
                                <strong>Free Trial:</strong> We may offer a free trial period. At the end of the
                                trial, you will be charged the applicable subscription fee unless you cancel.
                            </p>
                            <p>
                                <strong>Price Changes:</strong> We reserve the right to modify our pricing with
                                30 days advance notice to existing subscribers.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Privacy and Data */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Privacy and Data Protection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                Your privacy is important to us. Our Privacy Policy explains how we collect,
                                use, and protect your information when you use our Service.
                            </p>
                            <p>
                                <strong>Data Ownership:</strong> You retain all rights to your data. We do not
                                claim ownership of any content you upload or create using our Service.
                            </p>
                            <p>
                                <strong>Data Security:</strong> We implement industry-standard security measures
                                to protect your data, including encryption and secure data centers.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Termination */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Termination</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                <strong>By You:</strong> You may terminate your account at any time by contacting
                                our support team or using the account cancellation feature.
                            </p>
                            <p>
                                <strong>By Us:</strong> We may terminate or suspend your account if you violate
                                these Terms or engage in conduct that we deem harmful to our Service or other users.
                            </p>
                            <p>
                                <strong>Effect of Termination:</strong> Upon termination, your right to use the
                                Service will cease immediately. Your data will be deleted within 30 days unless
                                required to be retained by law.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Limitation of Liability */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Limitation of Liability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                To the maximum extent permitted by law, Gestionate shall not be liable for any
                                indirect, incidental, special, consequential, or punitive damages, including
                                without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-xl font-semibold mb-4">Questions about these Terms?</h3>
                            <p className="opacity-90 mb-4">
                                If you have any questions about these Terms of Service, please contact us.
                            </p>
                            <p className="font-semibold">legal@gestionate.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default TermsView;
