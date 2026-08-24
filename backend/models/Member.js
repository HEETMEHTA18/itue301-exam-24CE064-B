const mongoose = require('mongoose');
const { hashPassword, verifyPassword, isHashed, MIN_LENGTH } = require('../utils/password');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // Never returned by queries unless explicitly re-selected with .select('+password')
    select: false
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
  },
  membershipType: {
    type: String,
    enum: {
      values: ['basic', 'premium', 'platinum'],
      message: '{VALUE} is not a valid membership type'
    },
    default: 'basic'
  },
  role: {
    type: String,
    enum: {
      values: ['member', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'member'
  }
}, { timestamps: true });

// Hash plain-text passwords before validation completes.
// Runs on .create(), .save() and seed inserts; skips values already hashed
// so re-saving a document never double-hashes.
// NOTE: Mongoose 9 dropped next-callback middleware - async hooks only.
memberSchema.pre('validate', async function () {
  if (this.password && !isHashed(this.password)) {
    if (this.password.length < MIN_LENGTH) {
      this.invalidate('password', `Password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    this.password = hashPassword(this.password);
  }
});

/** Constant-time password check. Requires the doc to be loaded with .select('+password'). */
memberSchema.methods.comparePassword = function (plain) {
  return verifyPassword(plain, this.password);
};

// Belt-and-braces: strip the hash from any JSON serialisation.
memberSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('Member', memberSchema);
