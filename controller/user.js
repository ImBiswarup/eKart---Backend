const User = require("../model/user");
const Item = require("../model/items");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupHandler = async (req, res) => {
  try {
    const { username, email, password, role, image } = req.body;

    if (!username || !email || !password || !role || !image) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      image,
      userCart: { wishlist: [], cart: [] },
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const payload = {
      id: user._id,
      name: user.username,
      email: user.email,
      role: user?.role,
      imageUrl: user.userImageUrl,
      createdAt: user.createdAt,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    user.token = token;
    await user.save();

    console.log(user);

    res.status(200).json({ user, message: "Login successful." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const logoutHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.token = '';
    await user.save();

    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const addToCart = async (req, res) => {
  const { itemQuantity, cartItem } = req.body;

  console.log("cartItem:", cartItem);

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Incoming addToCart request:");
    console.log("Item Quantity:", itemQuantity);
    console.log("Cart Item:", JSON.stringify(cartItem, null, 2));

    if (!Number.isInteger(itemQuantity) || itemQuantity <= 0) {
      return res.status(400).json({ message: "Invalid item quantity." });
    }

    const item = await Item.findById(cartItem._id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.quantity < itemQuantity) {
      return res.status(400).json({ message: "Not enough stock available." });
    }

    const existingCartItem = user.userCart.cart.find(
      (cartItem) => cartItem.item.toString() === item._id.toString()
    );

    if (existingCartItem) {
      existingCartItem.quantity += itemQuantity;
    } else {
      user.userCart.cart.push({ item: item._id, quantity: itemQuantity });
    }

    item.quantity -= itemQuantity;
    item.stockStatus = item.quantity > 0 ? "In Stock" : "Out of Stock";
    await item.save();

    user.markModified("userCart.cart");
    await user.save();

    res.status(200).json({
      message: "Item added to cart successfully and stock updated.",
      cart: user.userCart.cart,
      remainingStock: item.quantity,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const removeFromCart = async (req, res) => {
  const { cartItemId } = req.body;

  console.log("cartItemId:", cartItemId);

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Incoming removeFromCart request:");
    console.log("Cart Item ID:", cartItemId);

    if (!cartItemId) {
      return res.status(400).json({ message: "cartItemId is required." });
    }

    const existingCartItem = user.userCart.cart.find(
      (cart) => cart.item.toString() === cartItemId
    );

    if (!existingCartItem) {
      return res.status(400).json({ message: "Item not found in cart." });
    }

    const item = await Item.findById(cartItemId);
    if (item) {
      item.quantity += existingCartItem.quantity;
      item.stockStatus = "In Stock";
      await item.save();
    }

    user.userCart.cart = user.userCart.cart.filter(
      (cart) => cart.item.toString() !== cartItemId
    );

    user.markModified("userCart.cart");

    await user.save();

    res.status(200).json({
      message: "Item removed from cart successfully and stock updated.",
      cart: user.userCart.cart, 
      remainingStock: item ? item.quantity : "N/A",
    });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllUsers = async (req, res) => {
  const allUsers = await User.find({})
  return res.json(allUsers);
};

const getCartItems = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).populate("userCart.cart.item");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ cart: user.userCart.cart });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getActualUser = async (req, res) => {
  try {
    // console.log("Params received:", req.params);
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getActualUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllItems = async (req, res) => {
  const allItems = await Item.find({})
  return res.json(allItems);
};


module.exports = { loginHandler, signupHandler, logoutHandler, addToCart, removeFromCart, getAllUsers, getCartItems, getAllItems, getActualUser };
