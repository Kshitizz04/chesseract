import Image from "next/image";


export interface CountryOption {
    code: string;
    name: string;
}
  
export const countryOptions: CountryOption[] = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "IN", name: "India" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" },
    { code: "BR", name: "Brazil" },
    // Add more countries as needed
];

export const getCountryNameByCode = (code: string): string => {
    const country = countryOptions.find(c => c.code === code.toUpperCase());
    return country ? country.name : "Unknown Country";
};

function CountryFlag({ countryCode }: { countryCode: string }) {
    if (!countryCode || countryCode === "Unknown") {
      return (
        <span className="text-2xl" title="Unknown Country">🌏</span>
      );
    }
    
    return (
        <div className="relative w-6 h-6 rounded-full">
            <Image
                src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                alt={getCountryNameByCode(countryCode)}
                title={getCountryNameByCode(countryCode)}
                width={24}
                height={18}
                className="object-cover w-full h-full rounded-full"
            />
        </div>
    );
}

export default CountryFlag;

