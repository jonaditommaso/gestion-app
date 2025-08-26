import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
// import { getTranslations } from 'next-intl/server';
// import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail,  Clock, MessageSquare, Headphones } from 'lucide-react';

const ContactView = async () => {
    const user = await getCurrent();
    //const t = await getTranslations('landing');

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-20"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex gap-14 w-[90%] justify-center items-center mt-20 p-2 max-sm:flex-col max-sm:gap-8">
                    <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
                        <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
                        <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                            Contact Us
                        </h1>
                        <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-2xl'>
                            Have questions? Need support? Want to learn more about Gestionate?
                            We would love to hear from you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-6xl mx-auto px-6">

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        Email Us
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 mb-2">General inquiries</p>
                                    <p className="font-semibold text-blue-600">hello@gestionate.com</p>
                                    <p className="text-slate-600 mb-2 mt-4">Support</p>
                                    <p className="font-semibold text-blue-600">support@gestionate.com</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <Headphones className="w-5 h-5 text-green-600" />
                                        Live Support
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 mb-4">
                                        Get instant help from our support team
                                    </p>
                                    <Button className="w-full">
                                        Start Live Chat
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                        Response Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Live Chat:</span>
                                            <span className="font-semibold">Instant</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Email:</span>
                                            <span className="font-semibold">24 hours</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Support:</span>
                                            <span className="font-semibold">4 hours</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        Send us a Message
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="john@company.com" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company (Optional)</Label>
                                        <Input id="company" placeholder="Your Company" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="How can we help you?" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more about your inquiry..."
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <Button className="w-full" size="lg">
                                        Send Message
                                    </Button>

                                    <p className="text-sm text-slate-500 text-center">
                                        We typically respond within 24 hours during business days.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* FAQ Quick Links */}
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            Looking for quick answers?
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Check out our FAQ section for instant answers to common questions.
                        </p>
                        <Button variant="outline" size="lg">
                            Visit FAQ
                        </Button>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default ContactView;
