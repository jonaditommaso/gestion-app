'use client'
import FadeLoader from "react-spinners/FadeLoader";
import { useGetRecord } from "./api/use-get-record";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload } from "lucide-react";
import { useRef } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';
import { fileSchema } from "./schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useUploadFile } from "./api/use-upload-file";
import { useFilePreviewsFromIds } from "./api/use-file-preview";
import Image from "next/image";
import PDFPreview from "./components/PDFPreview";

const RecordView = () => {
    const { data: record, isPending } = useGetRecord();
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadFile } = useUploadFile();
    const t = useTranslations('records');

    const { previews } = useFilePreviewsFromIds();

    const form = useForm<zod.infer<typeof fileSchema>>({
        resolver: zodResolver(fileSchema),
    });

    if(isPending) return <FadeLoader color="#999" width={3} className="mt-5" />

    const onSubmit = async (values: zod.infer<typeof fileSchema>) => {

        const formData = new FormData();

        if (values.file) {
            formData.append('file', values.file);
        }

        uploadFile(formData);
    }

    const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            form.setValue('file', file);
            form.handleSubmit(onSubmit)();
        }
    }

    return (
        <div className="self-start ml-14 flex">
            <div className="flex flex-col gap-2">
                {record?.data.map((item, index) => {
                    const parsed = JSON.parse(item) as Record<string, string>;

                    return (
                        <Card key={index} className="bg-sidebar">
                            <CardContent className="flex flex-col gap-4 pt-6">
                                {Object.entries(parsed).map(([key, value]) => (
                                    <div key={key}>
                                        <strong>{key}:</strong> {value}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <div className="mx-5 flex gap-2">
                <Form {...form}>
                    <form encType='multipart/form-data' className="flex gap-2">
                        <div className={`border-2 border-dashed rounded-lg text-center flex flex-col justify-evenly items-center focus:outline-none cursor-pointer border-blue-300 h-32 w-32`} onClick={() => inputRef.current?.click()}>
                            <input
                                className='hidden'
                                type='file'
                                name='file'
                                accept='.jpg, .png, .jpeg, .pdf'
                                ref={inputRef}
                                onChange={handleUploadFile}
                            />
                            <CloudUpload className="text-blue-400 h-10 w-10" strokeWidth={1} />
                            <p className="text-[10px] text-muted-foreground">{t('supported-record-files')}</p>
                        </div>

                        {previews?.map(({ id, url, type, name }) => (
                            <div key={id}>
                                {type.startsWith('image/') && (
                                    <Image src={url} alt={`Archivo ${id}`} width={128} height={128} />
                                )}
                                {type === 'application/pdf' && (
                                    <PDFPreview url={url} title={name} />
                                )}
                            </div>
                        ))}
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default RecordView;