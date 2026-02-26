import { Suspense } from "react";
import NewOrgView from "./NewOrgView";

const NewOrgPage = () => {
    return (
        <Suspense>
            <NewOrgView />
        </Suspense>
    );
};

export default NewOrgPage;
