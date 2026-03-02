import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set. Please add it to your environment variables.');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripeInstance;
}

// Export the getter for cases where direct Stripe access is needed
export { getStripe };

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number; // Price in dollars
  interval?: 'month' | 'year' | 'week' | 'day';
}

export interface UpdateProductInput {
  stripeProductId: string;
  stripePriceId?: string;
  name?: string;
  description?: string;
  price?: number; // Price in dollars
  interval?: 'month' | 'year' | 'week' | 'day';
}

/**
 * Creates a Stripe product and price for a subscription plan
 */
export async function createStripeProduct(input: CreateProductInput): Promise<{
  productId: string;
  priceId: string;
}> {
  const stripeClient = getStripe();

  // Create the product
  const product = await stripeClient.products.create({
    name: input.name,
    description: input.description || undefined,
  });

  // Create the price (recurring subscription)
  const price = await stripeClient.prices.create({
    product: product.id,
    unit_amount: Math.round(input.price * 100), // Convert to cents
    currency: 'usd',
    recurring: {
      interval: input.interval || 'month',
    },
  });

  return {
    productId: product.id,
    priceId: price.id,
  };
}

/**
 * Updates a Stripe product and optionally creates a new price if price changed
 */
export async function updateStripeProduct(input: UpdateProductInput): Promise<{
  productId: string;
  priceId: string;
}> {
  const stripeClient = getStripe();
  const updates: Stripe.ProductUpdateParams = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.description !== undefined) {
    updates.description = input.description || undefined;
  }

  // Update the product if there are changes
  if (Object.keys(updates).length > 0) {
    await stripeClient.products.update(input.stripeProductId, updates);
  }

  let newPriceId = input.stripePriceId;

  // If price changed, we need to create a new price (Stripe prices are immutable)
  if (input.price !== undefined) {
    // Archive the old price if it exists
    if (input.stripePriceId) {
      await stripeClient.prices.update(input.stripePriceId, { active: false });
    }

    // Create new price
    const price = await stripeClient.prices.create({
      product: input.stripeProductId,
      unit_amount: Math.round(input.price * 100),
      currency: 'usd',
      recurring: {
        interval: input.interval || 'month',
      },
    });

    newPriceId = price.id;
  }

  return {
    productId: input.stripeProductId,
    priceId: newPriceId || '',
  };
}

/**
 * Deactivates a Stripe product and its prices
 */
export async function deactivateStripeProduct(productId: string): Promise<void> {
  const stripeClient = getStripe();

  // Get all prices for this product
  const prices = await stripeClient.prices.list({ product: productId });

  // Archive all prices
  for (const price of prices.data) {
    if (price.active) {
      await stripeClient.prices.update(price.id, { active: false });
    }
  }

  // Archive the product
  await stripeClient.products.update(productId, { active: false });
}

/**
 * Get price details from Stripe
 */
export async function getStripePrice(priceId: string): Promise<{
  amount: number;
  interval: string;
} | null> {
  try {
    const stripeClient = getStripe();
    const price = await stripeClient.prices.retrieve(priceId);
    return {
      amount: (price.unit_amount || 0) / 100, // Convert from cents to dollars
      interval: price.recurring?.interval || 'month',
    };
  } catch {
    return null;
  }
}

