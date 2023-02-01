const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { collection: "categories" } // properly pluralize 'category'
);

CategorySchema.virtual("url").get(function () {
  return `/categories/${this._id}`;
});

CategorySchema.virtual("urlDelete").get(function () {
  return `/categories/${this._id}/delete`;
});

module.exports = mongoose.model("Category", CategorySchema);
