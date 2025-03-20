const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Create superadmin if not exists
userSchema.statics.createSuperAdmin = async function () {
  try {
    console.log("Checking for existing superadmin...");
    const superadmin = await this.findOne({ isSuperAdmin: true });

    if (!superadmin) {
      console.log("No superadmin found. Creating one...");
      await this.create({
        username: process.env.SUPERADMIN_USERNAME || "superadmin",
        email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
        password: process.env.SUPERADMIN_PASSWORD || "superadmin123",
        role: "superadmin",
        isSuperAdmin: true,
      });
      console.log("Superadmin created successfully");
    } else {
      console.log("Superadmin already exists");
    }
  } catch (error) {
    console.error("Error creating superadmin:", error);
  }
};

const User = mongoose.model("User", userSchema);

// Create superadmin when the model is first loaded
User.createSuperAdmin();

module.exports = User;
