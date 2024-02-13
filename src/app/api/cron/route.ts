import { ProductDB } from '@/lib/models/product.model';
import { connectToDB } from '@/lib/mongoose';
import { generateEmailBody, sendEmail } from '@/lib/nodemailer';
import { scrapeAmazonProduct } from '@/lib/scraper';
import { getAveragePrice, getEmailNotifType } from '@/lib/utils';
import { getHighestPrice } from '@/lib/utils';
import { getLowestPrice } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    connectToDB();
    const products = await ProductDB.find({});
    if (!products) throw new Error('Not Found');

    // 1.SCRAPE LATESRT PRODUCT DETAILS & UPDATE DB
    const updateAllProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrapedProduct) throw new Error('Not Found');

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: currentProduct.currentPrice,
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await ProductDB.findOneAndUpdate(
          {
            url: product.url,
          },
          product,
        );
        // 2.CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);

        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          // Construct emailContent
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Get array of user emails
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      }),
    );

    return NextResponse.json({
      message: 'Ok',
      data: updateAllProducts,
    });
  } catch (error) {
    throw new Error(`Error in GET:${error}`);
  }
}
