const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  firm1: {
    type: String,
    required: true,
  },
  firm2: {
    type: String,
    required: true,
  },
  varianceList: [],
});

module.exports = mongoose.model("Data", dataSchema);
