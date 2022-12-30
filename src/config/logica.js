const Pinguptimerobot = require("../app/models/ping");

module.exports = function registrarPing(req) {
  Pinguptimerobot.findOne(
    { "local.friendly_name": req.body.friendly_name },
    function (err, user) {
      var newPing = new Pinguptimerobot(); // creamos modelo de usuario
      // var objectId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
      // newPing._id= objectId;
      newPing.local.friendly_name = req.body.friendly_name;
      newPing.local.url = req.body.url;
      newPing.local.id = 0;
      newPing.local.created = new Date().toString();
      newPing.local.updated = new Date().toString();
      newPing.local.status = "Down";
      newPing.local.type_ = req.body.type;
      newPing.save(function (err) {
        if (err) {
          throw err;
        }
      });
    }
  );
};

module.exports = function lisdb() {};
