const { Schema, model } = require('mongoose');
const toSlug = require('../utils/toSlug');

const requiredString = {
  type: String,
  required: [true, 'is required.'],
};

const ArticleSchema = new Schema(
  {
    slug: String,
    title: { ...requiredString },
    body: { ...requiredString },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ArticleSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);
  next();
});

module.exports = model('article', ArticleSchema);
