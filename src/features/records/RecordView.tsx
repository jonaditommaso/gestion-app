'use client'
import FadeLoader from "react-spinners/FadeLoader";
import { useGetRecord } from "./api/use-get-record";

const RecordView = () => {
    const { data, isPending } = useGetRecord();

    if(isPending) return <FadeLoader color="#999" width={3} className="mt-5" />

    return (
        <>
        </>
    );
}

export default RecordView;