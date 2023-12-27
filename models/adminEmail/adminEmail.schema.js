const mongoose = require('mongoose');

const adminEmailSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true
    },
    header: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const AdminEmail = mongoose.model('AdminEmail', adminEmailSchema);

module.exports = AdminEmail;