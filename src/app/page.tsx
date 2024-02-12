import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { getProductsAll } from '@/lib/Actions';
import { TProduct } from '@/types';
import Image from 'next/image';

export default async function Home() {
  const allProducts = await getProductsAll();
  // console.log(allProducts);

  return (
    <>
      <section className="px-6 md:px-20 py-24 border-2 border-red-500">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Starts Here:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </p>
            <h1 className="head-text">
              Unleash the power of <span className="text-primary">PriceWise</span>
            </h1>
            <p className="mt-6">
              Powerfull, self-serve product and growth anlytics to help you convert, engage, and
              retain more.
            </p>
            <SearchBar />
          </div>
          <HeroCarousel />
        </div>
      </section>
      <section className="trending-section">
        <h2 className="section-text">Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          <div className="flex flex-wrap gap-x-8 gap-y-16">
            {allProducts?.map((product: TProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
