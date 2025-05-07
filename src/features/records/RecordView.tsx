'use client'
import FadeLoader from "react-spinners/FadeLoader";
import { useGetRecord } from "./api/use-get-record";

const RecordView = () => {
    const { data: record, isPending } = useGetRecord();

    if(isPending) return <FadeLoader color="#999" width={3} className="mt-5" />

    return (
        <div>
            <div>
                {record?.data.map((item, index) => {
                    const parsed = JSON.parse(item) as Record<string, string>;

                    return (
                        <div key={index}>
                        {Object.entries(parsed).map(([key, value]) => (
                            <div key={key}>
                                <strong>{key}:</strong> {value}
                            </div>
                        ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RecordView;