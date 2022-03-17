const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51KVYUUSFTku4JBRSqFNWr8R66rrvvXKu4dP7Sa0I28tmp8OCITf5F0MRP3hfalP4dsXHbd5EVd52TmY1xszKznqW00W9jTTo8U"
);
const uuid = require("uuid");
const PORT = 8282;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("IT WORKS AT LOCALHOST");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("PRODUCT", product);
  console.log("PRICE", product.price);
  const idempotencyKey = uuid();
  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "rs",
          customer: customer.id,
          receipt_email: token.email,
          description: ` purchase of product.name`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

app.listen(PORT, () => {
  console.log(`Working on ${PORT}`);
});
