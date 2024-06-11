const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const { promotePropertyFun } = require('./propertyController');

const createStripeSession = asyncHandler(async (req, res) => {
  const { item } = req.body;
  // const { propertyId,  productId} = req.body;
  // console.log('Item:', item);

  const redirectURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://zameen-visit.vercel.app/property-list';

  // Ensure to use price_data as specified by the new Stripe API
  const transformedItem = {
    price_data: {
      currency: 'pkr',
      product_data: {
        name: item.title, // Changed from item.name to item.title
        images: [item.image||'https://via.placeholder.com/150'],
      },
      unit_amount: item.price * 100, // Stripe expects amount in cents/pence
    },
    quantity: item.quantity || 1, // Default quantity to 1 if not provided
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [transformedItem],
      mode: 'payment',
      success_url: `${redirectURL}?status=success&propertyId=${item.propertyId}&productId=${item.productId}`,
      cancel_url: `${redirectURL}?status=cancel`,
      metadata: {
        description: item.description, // Use metadata for additional info
      },
    });
    console.log('Stripe session created:', session);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  createStripeSession,
};
