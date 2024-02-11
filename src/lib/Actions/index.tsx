'use server';

import { scrapeAmazonProduct } from '../scrape';

export async function scrapeAndStoreProduct(productUrl: string) {
  if (productUrl) {
    try {
      const scrapProduct = await scrapeAmazonProduct(productUrl);
    } catch (error: any) {
      throw new Error(`Failed to create or update product ${error.message}`);
    }
  }
}
