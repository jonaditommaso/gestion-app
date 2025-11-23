import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormInputProps {
    id: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'email';
    variant?: 'input' | 'textarea';
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    className?: string;
}

const FormInput = ({
    id,
    label,
    placeholder,
    type = 'text',
    variant = 'input',
    error,
    value,
    onChange,
    onBlur,
    className
}: FormInputProps) => {
    const hasError = !!error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={id}>{label}</Label>
            {variant === 'textarea' ? (
                <Textarea
                    id={id}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                    className={cn(
                        "min-h-[120px]",
                        hasError && "border-red-500 focus-visible:ring-red-500"
                    )}
                />
            ) : (
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                    className={cn(
                        hasError && "border-red-500 focus-visible:ring-red-500"
                    )}
                />
            )}
            {hasError && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

export default FormInput;