const mongoose = require("mongoose");

const notificationsSchema = new mongoose.Schema({
  local: {
    username: String,
    friendly_name: String,
    url: String,
    id: Number,
    created: String,
    updated: String,
    status: String,
    numNotificatios: Number,
  },
});

module.exports = mongoose.model("Notifications", notificationsSchema);
