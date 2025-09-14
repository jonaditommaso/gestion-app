import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    buttonText: string;
}

const SuccessModal = ({ isOpen, onClose, title, description, buttonText }: SuccessModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <DialogTitle className="text-2xl text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center text-base my-4 text-balance">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SuccessModal;