import { ChevronRight } from "lucide-react";
import svgPaths from "../imports/svg-8vu20olhr3";

const imgElectricGuitar = "/images/imgElectricGuitar.png";
const imgViolin = "/images/imgViolin.png";
const imgPiano = "/images/imgPiano.png";

export default function HomePage() {
  const categories = [
    "Guitars",
    "Electric Guitars",
    "Violet",
    "Saxophone",
    "Saxophone"
  ];

  const products = [
    {
      id: 1,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    },
    {
      id: 2,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    },
    {
      id: 3,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    },
    {
      id: 4,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    },
    {
      id: 5,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    },
    {
      id: 6,
      title: "YAMAHA Rasengan Limited Edit..",
      price: "$100.50",
      image: imgElectricGuitar
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-yellow-500 via-orange-400 to-orange-500 rounded-3xl p-12 mx-8 mt-8 overflow-hidden">
        <div className="relative z-10 max-w-md">
          <h2 className="mb-2">Look for any instrument you want</h2>
          <p className="mb-6 text-orange-900">find or try out an instrument</p>
          <button className="bg-orange-900 text-white px-6 py-2 rounded-full hover:bg-orange-800 transition-colors ">
            Browse
          </button>
        </div>

        {/* Instrument Links */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex gap-12">
          {/* Guitars */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32">
              <img src={imgElectricGuitar} alt="Guitar" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 cursor-pointer hover:opacity-75">
              <span>Guitars</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 23 23">
                <path d={svgPaths.p4a21760} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.72398" />
              </svg>
            </div>
          </div>

          {/* Pianos */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32">
              <img src={imgPiano} alt="Piano" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 cursor-pointer hover:opacity-75">
              <span>Pianos</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 23 23">
                <path d={svgPaths.p4a21760} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.72398" />
              </svg>
            </div>
          </div>

          {/* Violin */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32">
              <img src={imgViolin} alt="Violin" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 cursor-pointer hover:opacity-75">
              <span>Violin</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 23 23">
                <path d={svgPaths.p4a21760} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.72398" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Categories */}
      <section className="py-16 px-8">
        <h2 className="text-center mb-12 text-xl">Browse</h2>
        <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className="w-[225px] h-[225px] rounded-full bg-gray-300" />
              <p className="text-center">{category}</p>
            </div>
          ))}

        </div>
      </section>

      {/* Popular Deals */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="mb-8 flex items-center justify-between">
          <h2>Popular Deals</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Advertised Listings</span>
            <a href="#" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Browse All
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-3">
              <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="truncate">{product.title}</p>
              <p className="font-semibold">{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Banner */}
      <div className="mx-8 my-16 flex justify-center">
        <div className="bg-linear-to-r from-blue-400 to-blue-500 rounded-3xl p-12 text-center max-w-2xl w-full">
          <h2 className="mb-4">
            <span>Become a </span>
            <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              premium member!
            </span>
          </h2>
          <p className="mb-6">
            <span>Enjoy the benefits of discounts and </span>
            advertised listings!
          </p>
          <a href="/subscribe">
            <button className="bg-gray-800 text-white px-8 py-2 rounded-full hover:bg-gray-700 transition-colors" href="./subscribe">
              View Plan
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
