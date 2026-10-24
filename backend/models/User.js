const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addresses: [addressSchema],
    defaultShippingAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'User.addresses' },
    defaultBillingAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'User.addresses' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    adminKey: {
      type: String,
      required: false, // Only required for admin users
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
