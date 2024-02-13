'use server';

import { TUser } from '@/types';
import { ProductDB } from '../models/product.model';
import { connectToDB } from '../mongoose';
import { scrapeAmazonProduct } from '../scraper';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils';
import { revalidatePath } from 'next/cache';
import { generateEmailBody, sendEmail } from '../nodemailer';

export async function scrapeAndStoreProduct(productUrl: string) {
  if (productUrl) {
    try {
      connectToDB();

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
    connectToDB();
    const product = await ProductDB.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getProductsAll() {
  try {
    connectToDB();
    const products = await ProductDB.find();
    if (!products) return null;
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();
    const currentProduct = await ProductDB.findById(productId);
    if (!currentProduct) return null;

    const similarProduct = await ProductDB.find({ _id: { $ne: productId } }).limit(3);
    if (!similarProduct) return null;

    return similarProduct;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await ProductDB.findById(productId);
    if (!product) return;

    const userExists = product.users.some((user: TUser) => user.email === userEmail);
    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();
      const emailContent = await generateEmailBody(product, 'WELCOME');
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
