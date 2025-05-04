import { NEXT_PUBLIC_APP_URL, STRIPE_SECRET_KEY } from "@/config";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Stripe } from 'stripe'
import { priceSchema } from "../schemas";

const app = new Hono()

//? esto lista mis productos, para mapearlos directamente en pricing, pero por ahora lo voy a dejar como esta.
// .get('/stripe', async () => {
//     const stripe = new Stripe(STRIPE_SECRET_KEY);
//     const prices = await stripe.prices.list();

//     return NextResponse.json(prices.data)
// })



.post(
    '/stripe',
    zValidator('json', priceSchema),
    async ctx => {
        const { plan } = await ctx.req.json();

        const stripe = new Stripe(STRIPE_SECRET_KEY);

        const products = await stripe.products.list()

        const product = products.data.find(prod => prod.metadata.plan === plan);

        if(!product?.default_price) {
            return ctx.json({ error: 'There is no plan' }, 400)
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: product?.default_price.toString(),
                quantity: 1
            }],
            success_url: `${NEXT_PUBLIC_APP_URL}/signup?plan=${plan}`,
            cancel_url: `${NEXT_PUBLIC_APP_URL}/pricing`,
        });

        return ctx.json({ url: session.url })
    }
)

export default app;