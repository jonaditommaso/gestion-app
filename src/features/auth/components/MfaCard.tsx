'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CircleX, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMfa } from "../api/use-mfa";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MfaCard = ({ challengeId }: { challengeId: string }) => {
    const t = useTranslations('auth');

    const [code, setCode] = useState(Array(6).fill(""));
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const submittedRef = useRef(false);
    const { mutate: verifyMfa, isError: thereIsError, reset: resetMfaError } = useMfa();


    useEffect(() => {
        inputRefs.current[0]?.focus();
      }, []);

    const submitCode = useCallback((digits: string[]) => {
        if (submittedRef.current) return;
        if (!digits.every((char) => char !== "")) return;

        submittedRef.current = true;
        setIsVerifying(true);

        const finalCode = digits.join("");
        verifyMfa({
            json: {
                mfaCode: finalCode,
                challengeId
            }
        }, {
            onError: () => {
                submittedRef.current = false;
                setIsVerifying(false);
                setCode(Array(6).fill(""));
                inputRefs.current[0]?.focus();
            }
        });
    }, [challengeId, verifyMfa]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return; // solo nums o vacío

        if (thereIsError) {
            resetMfaError();
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
          inputRefs.current[index + 1]?.focus();
        }

        if (value && newCode.every((char) => char !== "")) {
          submitCode(newCode);
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      };

    return (
        <div>
            <h1 className="text-center text-2xl mb-2">{t('authentication-code-mfa')}</h1>
            <Card className="w-full h-full md:w-[490px] border-none shadow-md">
                <CardHeader className="flex items-center justify-center text-center p-7">
                    <CardTitle className="text-2xl">{t('authentication-code-title')}</CardTitle>
                    <span><KeyRound size={24} /></span>
                </CardHeader>
                <Separator />
                <CardContent className="p-7 flex flex-col items-center gap-2 min-h-[250px]">
                    <div className="flex gap-2">
                        {code.map((char, index) => (
                        // also exist InputOTP component, check it out
                            <Input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={char}
                                placeholder="X"
                                autoComplete="one-time-code"
                                ref={(el) => {
                                    if (el) inputRefs.current[index] = el;
                                }}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={"w-10 h-12 text-center font-semibold text-lg focus:outline-none focus:ring-0 focus:border-primary caret-transparent"}
                            />
                        ))}
                    </div>

                    <Button disabled={isVerifying} className="w-[300px]">
                        {t(`authentication-code-${isVerifying ? 'verifying' : 'verify'}-button`)}
                    </Button>

                    {thereIsError && (
                        <Alert variant="destructive" className="w-full border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mt-4 flex flex-col items-center text-center">
                            <div className="mb-2">
                                <CircleX size={20} className="text-red-500" />
                            </div>
                            <AlertDescription className="whitespace-pre-line text-balance text-center">{t('authentication-code-invalid-error')}</AlertDescription>
                        </Alert>
                    )}

                    <Label className="text-muted-foreground text-center balance w-[290px] mt-4">{t('authentication-code-info')}</Label>
                </CardContent>
            </Card>
        </div>
    );
}

export default MfaCard;