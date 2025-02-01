const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required."],
  },
  price: {
    type: Number,
    required: [true, "Price is required."],
    min: [0, "Price cannot be negative."],
  },
  imageUrl: {
    type: String,
    default: "https://res.cloudinary.com/djrdw0sqz/image/upload/v1725100842/myImg_q3lyty.jpg",
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
          .test(v);
      },
      message: props => `${props.value} is not a valid image URL!`,
    },
  },
  category: {
    type: String,
    required: [true, "Category is required."],
    enum: ["Electronics", "Clothing", "Home Appliances", "Books", "Toys", "Other"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required."],
    min: [1, "Quantity must be at least 1."],
  },
  description: {
    type: String,
    required: [true, "Description is required."],
    maxlength: [500, "Description cannot exceed 500 characters."],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "CreatedBy is required."],
  },
  stockStatus: {
    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: function () {
      return this.quantity > 0 ? "In Stock" : "Out of Stock";
    },
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative."],
    max: [100, "Discount cannot exceed 100%."],
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

itemSchema.virtual('finalPrice').get(function () {
  return this.price * (1 - this.discount / 100);
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
