'use client';

import { scrapeAndStoreProduct } from '@/lib/Actions';
import Image from 'next/image';
import { FormEvent, useState } from 'react';

const isValidAmazonProductURL = (url: string): boolean => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes('amazon.com') ||
      hostname.includes('amazon.') ||
      hostname.endsWith('amazon')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

export function SearchBar() {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSumit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonProductURL(searchPrompt);
    if (!isValidLink) return alert('Please provide a valid Amazon link');

    try {
      setIsLoading(true);

      // Scrape the product page
      const scrapeProduct = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSumit}>
      <input
        type="text"
        className="searchbar-input"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="searchbar-btn disabled:cursor-not-allowed"
      >
        {!isLoading && 'Search'}
        {isLoading && <Spinner />}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <Image
      src={'/assets/icons/spinner.svg'}
      width={24}
      height={24}
      alt="spinner"
      className="mx-3"
    />
  );
}
