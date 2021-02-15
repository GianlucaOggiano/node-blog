const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const requiredString = {
  type: String,
  required: true,
};

const userSchema = new Schema(
  {
    username: {
      ...requiredString,
    },
    email: {
      ...requiredString,
    },
    password: { ...requiredString },
    resetToken: String,
    tokenExpirationDate: Date,
    bio: String,
    profile_Img: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
/**
 * @param {string} password
 */
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model('User', userSchema);
