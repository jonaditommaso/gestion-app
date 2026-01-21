import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare } from 'lucide-react'; //Clock,
import { Separator } from '@/components/ui/separator';
import ContactForm from './ContactForm';
import Link from 'next/link';

const ContactView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing.contact');

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
                        <div className="mb-8 flex justify-center">
                            <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                                <Mail className="h-4 w-4 text-blue-400" />
                                <div className="text-sm font-medium text-blue-300">
                                    {t('badge')}
                                </div>
                            </div>
                        </div>
                        <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                            {t('title')}
                        </h1>
                        <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg max-w-2xl'>
                            {t('description')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-6xl mx-auto px-6">

                    <div className="grid lg:grid-cols-2 gap-8"> {/* grid-cols-3 when uncomment content below */}
                        {/* Contact Information */}
                        {/* <div className="lg:col-span-1 space-y-6">
                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        {t('email-card-title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 mb-2">{t('email-general')}</p>
                                    <p className="font-semibold text-blue-600">{t('email-general-address')}</p>
                                    <p className="text-slate-600 mb-2 mt-4">{t('email-support')}</p>
                                    <p className="font-semibold text-blue-600">{t('email-support-address')}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                        {t('response-card-title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">{t('response-email')}</span>
                                            <span className="font-semibold">{t('response-email-time')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">{t('response-support')}</span>
                                            <span className="font-semibold">{t('response-support-time')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div> */}

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        {t('form-title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ContactForm />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    {/* FAQ Quick Links */}
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            {t('faq-title')}
                        </h2>
                        <p className="text-slate-600 mb-6">
                            {t('faq-description')}
                        </p>
                        <Link href="/faq">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8">
                                {t('faq-button')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default ContactView;
