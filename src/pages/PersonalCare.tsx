import { Layout } from "@/components/Layout/Layout";
import CategoryCard from "@/components/PersonalCare/CategoryCard";

const personalCareCategories = [
  { name: "Skincare" },
  { name: "Female Care" },
  { name: "Oral Care" },
  { name: "Haircare" },
  { name: "Men’s Care" },
  { name: "Mother & Baby Care" },
];

export default function PersonalCare() {
  const categoryImages: { [key: string]: string } = {
    "Skincare": "/placeholder.svg",
    "Female Care": "/placeholder.svg",
    "Oral Care": "/placeholder.svg",
    "Haircare": "/placeholder.svg",
    "Men’s Care": "/placeholder.svg",
    "Mother & Baby Care": "/placeholder.svg",
  };

  return (
    <Layout>
      <div className="flex-1 bg-white"> {/* Clean white background */}
        {/* <div className="text-sm text-gray-500 pt-4 pl-4 mb-2">
          Home / Personal Care
        </div> */}

        <h1 className="text-2xl font-semibold text-black pl-4 mb-6">
          Personal Care
        </h1>
        <h2 className="font-semibold text-black pl-4 mb-6">
          coming soon...
        </h2>

        <div className="relative w-full max-w-5xl mx-auto mt-6 mb-2 px-2">
          <div className="relative w-[500px] h-[500px] mx-auto">
            {personalCareCategories.map((category, index) => {
              const angle = (index * 360) / personalCareCategories.length;
              const radius = 180; // Distance from center - increased for better spacing
              const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
              const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
              
              return (
                <div
                  key={category.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <CategoryCard
                    title={category.name}
                    imgSrc={categoryImages[category.name]}
                  />
                </div>
              );
            })}
            
            {/* Center element - optional logo or title */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-semibold text-sm text-center">Personal<br/>Care</span>
              </div>
            </div>
          </div>
          
          {/* Mobile fallback - stack vertically on small screens */}
          <div className="block sm:hidden mt-8">
            <div className="grid grid-cols-1 gap-6">
              {personalCareCategories.map((category) => (
                <CategoryCard
                  key={`mobile-${category.name}`}
                  title={category.name}
                  imgSrc={categoryImages[category.name]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}