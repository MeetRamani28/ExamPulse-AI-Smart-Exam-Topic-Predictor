const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: [6, "Password Must Be At Least 6 Characters Long"],
      select: false,
    },

    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    providerId: { type: String, default: null },

    avatar: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ provider: 1, providerId: 1 });

module.exports = mongoose.model("User", userSchema);
