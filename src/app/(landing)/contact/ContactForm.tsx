'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormInput from './FormInput';
import SuccessModal from './SuccessModal';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

interface FormData {
    name: string;
    email: string;
    organization: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    organization?: string;
    subject?: string;
    message?: string;
}

const ContactForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        organization: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const t = useTranslations('landing.contact');

    const emailSchema = z.string().email();

    const validateEmail = (email: string): boolean => {
        try {
            emailSchema.parse(email);
            return true;
        } catch {
            return false;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('form-name-required');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('form-email-required');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('form-email-invalid');
        }

        if (!formData.organization.trim()) {
            newErrors.organization = t('form-organization-required');
        }

        if (!formData.subject.trim()) {
            newErrors.subject = t('form-subject-required');
        }

        if (!formData.message.trim()) {
            newErrors.message = t('form-message-required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error when user starts typing
        if (errors[id as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [id]: undefined }));
        }
    };

    const handleEmailBlur = () => {
        const email = formData.email.trim();
        if (!email) {
            setErrors(prev => ({ ...prev, email: t('form-email-required') }));
        } else if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: t('form-email-invalid') }));
        } else {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            // TODO add real API integration here
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Form data:', formData);
            setShowSuccess(true);
            setFormData({
                name: '',
                email: '',
                organization: '',
                subject: '',
                message: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccess(false);
    };

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                        id="name"
                        label={t('form-name-label')}
                        placeholder={t('form-name-placeholder')}
                        error={errors.name}
                        value={formData.name}
                        onChange={(value) => handleInputChange('name', value)}
                    />
                    <FormInput
                        id="email"
                        label={t('form-email-label')}
                        placeholder={t('form-email-placeholder')}
                        type="email"
                        error={errors.email}
                        value={formData.email}
                        onChange={(value) => handleInputChange('email', value)}
                        onBlur={handleEmailBlur}
                    />
                </div>

                <FormInput
                    id="organization"
                    label={t('form-organization-label')}
                    placeholder={t('form-organization-placeholder')}
                    error={errors.organization}
                    value={formData.organization}
                    onChange={(value) => handleInputChange('organization', value)}
                />

                <FormInput
                    id="subject"
                    label={t('form-subject-label')}
                    placeholder={t('form-subject-placeholder')}
                    error={errors.subject}
                    value={formData.subject}
                    onChange={(value) => handleInputChange('subject', value)}
                />

                <FormInput
                    id="message"
                    label={t('form-message-label')}
                    placeholder={t('form-message-placeholder')}
                    variant="textarea"
                    error={errors.message}
                    value={formData.message}
                    onChange={(value) => handleInputChange('message', value)}
                />

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('form-submit')}...
                        </>
                    ) : (
                        t('form-submit')
                    )}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                    {t('form-response-info')}
                </p>
            </form>

            <SuccessModal
                isOpen={showSuccess}
                onClose={closeSuccessModal}
                title={t('success-title')}
                description={t('success-description')}
                buttonText={t('success-button')}
            />
        </>
    );
};

export default ContactForm;