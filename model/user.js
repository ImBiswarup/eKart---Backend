const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  quantity: {
    type: Number,
    min: 1,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    image: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      default: "Customer",
      enum: ["Customer", "Seller"],
    },
    userCart: {
      wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
      ],
      cart: [cartItemSchema],
    },
    addedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    token: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
