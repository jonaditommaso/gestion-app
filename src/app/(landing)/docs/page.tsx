import LandingFooter from '@/features/landing/components/LandingFooter'
import { getCurrent } from '@/features/auth/queries'
import { redirect } from 'next/navigation'
import ProductDocsClient from '@/features/landing/components/docs/ProductDocsClient'

export default async function ProductDocs() {
    const user = await getCurrent()

    if (user) redirect('/')

    return (
        <div>
            <ProductDocsClient />
            <LandingFooter />
        </div>
    )
}
