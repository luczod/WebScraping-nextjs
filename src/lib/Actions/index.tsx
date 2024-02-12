'use server';

import { ProductDB } from '../models/product.model';
import { connectDB } from '../mongoose';
import { scrapeAmazonProduct } from '../scrape';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils';
import { revalidatePath } from 'next/cache';

export async function scrapeAndStoreProduct(productUrl: string) {
  if (productUrl) {
    try {
      connectDB();

      const scrapedProduct = await scrapeAmazonProduct(productUrl);
      if (!scrapedProduct) return;
      let product = scrapedProduct;
      const existingProduct = await ProductDB.findOne({ url: scrapedProduct.url });

      if (existingProduct) {
        const updatedPriceHistory: any = [
          ...existingProduct.priceHistory,
          {
            price: existingProduct.currentPrice,
          },
        ];

        product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };
      }

      const newProduct = await ProductDB.findOneAndUpdate(
        {
          url: scrapedProduct.url,
        },
        product,
        { upsert: true, new: true },
      );

      revalidatePath(`/products/${newProduct._id}`);
    } catch (error: any) {
      throw new Error(`Failed to create or update product ${error.message}`);
    }
  }
}

export async function getProductsById(productId: string) {
  try {
    connectDB();
    const product = await ProductDB.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getProductsAll() {
  try {
    connectDB();
    const products = await ProductDB.find();
    if (!products) return null;
    return products;
  } catch (error) {
    console.log(error);
  }
}
