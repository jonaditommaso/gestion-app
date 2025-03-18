import Link from "next/link";
import CustomWave from "./CustomWave";

const LandingFooter = () => {
    return (
        <>
            <CustomWave rotated rectColor="#9a3e6a" isBottom />

            <div className="w-full p-0 pb-2 bg-[#9a3e6a] mt-[-1px] text-white">
            <div className="flex flex-col items-start gap-1 ml-20">
                <Link href='/who-we-are'>Quienes somos</Link>
                <Link href='/faq'>FAQ</Link>
                <Link href='/'>Terms</Link>
                <Link href='/'>Contact Us</Link>
            </div>
            <p className="text-center text-xs mt-5">© 2025, Gestionate</p>
            </div>
        </>
    );
}

export default LandingFooter;