const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Number, required: true },
});

ItemSchema.virtual("url").get(function () {
  return `/items/${this._id}`;
});

ItemSchema.virtual("urlEdit").get(function () {
  return `/items/${this._id}/edit`;
});

ItemSchema.virtual("urlDelete").get(function () {
  return `/items/${this._id}/delete`;
});

ItemSchema.virtual("priceUSD").get(function () {
  return USDollar.format(this.price);
});

module.exports = mongoose.model("Item", ItemSchema);
