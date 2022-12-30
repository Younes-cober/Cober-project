const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const pinguptimerobotSchema = new mongoose.Schema({
  local: {
    username: String,
    friendly_name: String,
    url: String,
    id: Number,
    created: String,
    updated: String,
    status: String,
    type_: Number,
  },
});

module.exports = mongoose.model("Pinguptimerobot", pinguptimerobotSchema);
