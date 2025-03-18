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
    throw error;
  }
};

// Create superadmin if not exists
userSchema.statics.createSuperAdmin = async function () {
  try {
    const superadmin = await this.findOne({ role: "superadmin" });
    if (!superadmin) {
      const newSuperAdmin = new this({
        username: "prabesh",
        email: "prabesh@ajimadesign.com",
        password: "Ajima@123", // This will be hashed automatically
        role: "superadmin",
        isSuperAdmin: true,
      });
      await newSuperAdmin.save();
      console.log("Superadmin created successfully");
    }
  } catch (error) {
    console.error("Error creating superadmin:", error);
  }
};

const User = mongoose.model("User", userSchema);

// Create superadmin when the model is first loaded
User.createSuperAdmin();

module.exports = User;
