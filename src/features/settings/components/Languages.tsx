import Image from "next/image";

const Languages = () => {
    return (
        <div>
            <p className="text-xl">Languages</p>
            <div className="flex gap-4 mt-4">
                <Image src="/flags/ES-flag.svg" alt="Spanish flag" width={24} height={16} />
                <Image src="/flags/US-flag.svg" alt="United States flag" width={22} height={16} className="transform scale-125" />
                <Image src="/flags/IT-flag.svg" alt="Italian flag" width={24} height={16} />
            </div>
        </div>
    );
}

export default Languages;