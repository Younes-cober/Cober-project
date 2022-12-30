const Pinguptimerobot = require("../app/models/ping");
const dotenv = require("dotenv");
dotenv.config();
var {
  funcionChecking,
  allNotificationsList,
  removeUser,
  deletePingUserMejorada,
  notificationsList,
  escalaHorasMejorada,
  escalaDiasMejorado,
  adecuadarListaMinutos,
  adecuadarListaHoras,
  EliminarDuplicadoFriendlyNameConUsername,
  escalaBase,
  listaHoras,
  listaDias,
  listaHoras,
  listaDias,
  escalaMinutos,
} = require("../config/funciones");

const user = require("./models/user");

const Notifications = require("../app/models/notifications");

module.exports = (app, passport, request) => {
  //-------------------------------------   API UpTimeRobot  -------------------------------------

  var listaTiendas = [];
  var listaTiendasDB = [];

  var auth = {
    api_key: process.env.API_KEY,
    host: process.env.HOST,
  };

  var optionsListMonitor = {
    method: "POST",
    url: `${auth.host}getMonitors?api_key=${auth.api_key}`,
    headers: {},
  };

  var optionsEditMonitor = {
    method: "POST",
    url: `${auth.host}editMonitor?api_key=${auth.api_key}`,
    headers: {},
    formData: {
      api_key: auth.api_key,
      id: "792931245",
      friendly_name: "Allbirds__",
      url: "www.allbirds.com",
      type: "3",
    },
  };

  //-----------------  endpoint de para api uptimerobot Begenning-------------------------------------

  app.get("/selectTienda", (req, res) => {
    try {
      res.render("selectTienda", {
        message: req.flash("loginMessage"),
      });
      listaTiendasDB = [];
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/selectTienda", (req, res) => {
    try {
      Pinguptimerobot.find(
        { "local.username": req.body.username },
        function (err, user) {
          if (err) {
            return done(err);
          }

          console.log(req.body);

          for (let ii = 0; ii < user.length; ii++) {
            listaTiendasDB.push(user[ii].local);
          }
          res.render("unatienda", { lista: listaTiendasDB });
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  var listaFriendlyNameApi = [];
  var contadorDeCambios = 0;

  //-----------------   API UpTimeRobot End-------------------------------------

  app.get("/checking", (req, res) => {
    try {
      request(optionsListMonitor, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response.body);
        const obj = JSON.parse(response.body);
        for (let i = 0; i < obj.monitors.length; i++) {
          listaFriendlyNameApi.push(obj.monitors[i].friendly_name);
          //  console.log(listaFriendlyNameApi[i]);
          listaTiendas.push(obj.monitors[i]);

          // busca en la base de datos por cada friendly name
          Pinguptimerobot.find(
            { "local.friendly_name": obj.monitors[i].friendly_name },
            function (err, user) {
              if (err) {
                return done(err);
              }

              for (let ii = 0; ii < user.length; ii++) {
                listaTiendasDB.push(user[ii].local);
              }
              var lastupdatedStatus = lastUpdateClientStatus(listaTiendasDB);

              console.log("lastupdatedStatus: ", lastupdatedStatus);
              console.log("obj.monitors[i].status: ", obj.monitors[i].status);
              listaTiendasDB = [];
              ///////////////////// comparar los estados para decidir si hago un update o no
              var estado = "";
              if (obj.monitors[i].status == 2) {
                estado = "Up";
              } else {
                estado = "Down";
              }
              if (
                (estado == "Down" && lastupdatedStatus == "Down") ||
                (estado == "Up" && lastupdatedStatus == "Up")
              ) {
                console.log("No hago nada");
              } else {
                console.log("Hogo update");
                contadorDeCambios++;
                var newPing = new Pinguptimerobot(); // creamos modelo de usuario

                console.log("user[0].local.username", user[0].local.username);
                newPing.local.username = user[0].local.username;
                newPing.local.friendly_name = obj.monitors[i].friendly_name;
                newPing.local.url = obj.monitors[i].url;
                newPing.local.id = obj.monitors[i].id;
                newPing.local.created = new Date().toString();
                newPing.local.updated = new Date().toString();
                if (obj.monitors[i].status == 2) {
                  newPing.local.status = "Up";
                } else {
                  newPing.local.status = "Down";
                }
                newPing.local.type_ = obj.monitors[i].type;

                newPing.save(function (err) {
                  if (err) {
                    throw err;
                  }
                });
              }
            }
          );
        }
        contadorDeCambios = 0;
      });

      res.render("checking", { lista: listaTiendasDB });
      listaTiendasDB = [];
      listaTiendas = [];
    } catch (error) {
      console.log(error);
    }
  }); //app.get

  app.get("/listMonitorDB", (req, res) => {
    const listaClientes = async () => {
      try {
        Pinguptimerobot.find(function (err, user) {
          if (err) {
            return done(err);
          }
          console.log(user[0].local);

          for (let i = 0; i < user.length; i++) {
            // console.log(user[i].local);
            listaTiendasDB.push(user[i].local);
          }
        });
        res.render("listMonitorDB", { lista: listaTiendasDB });
        listaTiendasDB = [];
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    listaClientes();
  }); //app.get

  app.get("/listMonitor", (req, res) => {
    const listaClientes = async () => {
      try {
        request(optionsListMonitor, function (error, response) {
          if (error) throw new Error(error);
          //console.log(response.body);
          const obj = JSON.parse(response.body);
          for (let i = 0; i < obj.monitors.length; i++) {
            console.log(obj.monitors[i]);
            listaTiendas.push(obj.monitors[i]);
          }
          console.log(
            "numero de tiendas monitoreada es:" + listaTiendas.length
          );
          console.log("listMonitor");
        });
        res.render("listMonitor", { lista: listaTiendas });
        listaTiendas = [];
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    listaClientes();
  }); //app.get

  app.get("/newMonitor", (req, res) => {
    const newClientes = async () => {
      try {
        res.render("newMonitor", {
          message: req.flash("loginMessage"),
        });
        console.log("newMonitor");
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    newClientes();
  });

  app.post("/newMonitor", (req, res) => {
    var optionsNewMonitor = {
      method: "POST",
      url: `${auth.host}newMonitor?api_key=${auth.api_key}`,
      headers: {},
      formData: {
        api_key: auth.api_key,
        friendly_name: req.body.friendly_name,
        url: req.body.url,
        type: req.body.type,
      },
    };
    const newClientes = async () => {
      try {
        request(optionsNewMonitor, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
          var newPing = new Pinguptimerobot(); // creamos modelo de usuario

          newPing.local.friendly_name = req.body.friendly_name;
          newPing.local.url = req.body.url;
          newPing.local.id = 0;
          newPing.local.created = new Date().toString();
          newPing.local.updated = new Date().toString();
          newPing.local.status = "Up";
          newPing.local.type_ = req.body.type;

          newPing.save(function (err) {
            if (err) {
              throw err;
            }
          });
        });
        //registrarPing(req);

        res.render("home");

        console.log("newMonitor");
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    newClientes();
  });

  app.get("/editMonitor", (req, res) => {
    const editClientes = async () => {
      try {
        request(optionsEditMonitor, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
        res.render("editMonitor");
        console.log("editMonitor");
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    editClientes();
  });

  app.post("/deleteMonitor", (req, res) => {
    var optionsDeleteMonitor = {
      method: "POST",
      url: `${auth.host}deleteMonitor?api_key=${auth.api_key}`,
      headers: {},
      formData: {
        api_key: auth.api_key,
        id: req.body.id,
      },
    };
    const deleteClientes = async () => {
      try {
        request(optionsDeleteMonitor, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });
        res.render("home");
        console.log("home");
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    deleteClientes();
  });

  app.get("/deleteMonitor", (req, res) => {
    const deleteClientes = async () => {
      try {
        res.render("deleteMonitor", {
          message: req.flash("loginMessage"),
        });
        console.log("deleteMonitor");
      } catch (error) {
        console.log(error);
      }
    }; //listaClientes
    deleteClientes();
  });
  //-----------------  endpoint de para api uptimerobot End-------------------------------------

  //------------------------------------------------------User space Begenning-------------------------------------------------

  app.get("/loginCober", (req, res) => {
    res.render("loginCober", {
      message: req.flash("loginMessage"),
    });
    console.log("loginCober");
  });

  app.post(
    "/loginCober",
    passport.authenticate("local-login", {
      successRedirect: "/userSpace",
      failureRedirect: "loginCober",
      failureFlash: true,
    })
  );

  app.get("/signupCober", (req, res) => {
    res.render("signupCober", {
      message: req.flash("signupMessage"),
    });
    console.log("signupCober");
  });

  app.post(
    "/signupCober",
    passport.authenticate("local-signup", {
      successRedirect: "/home",
      failureRedirect: "signupCober",
      failureFlash: true,
    })
  );

  app.get("/userSpace", isLoggedIn, (req, res) => {
    console.log("userSpace req.user", req.user.local.admin);
    if (!req.user.local.admin) {
      res.render("userSpace", {
        user: req.user,
      });
    } else {
      res.render("adminSpace", {
        user: req.user,
      });
    }
  });

  app.get("/addnewmonitor", isLoggedIn, (req, res) => {
    const newClientes = async () => {
      try {
        res.render("addnewmonitor", {
          message: req.flash("loginMessage"),
          user: req.user,
        });
        console.log("addnewmonitor get");
      } catch (error) {
        console.log(error);
      }
    };
    newClientes();
  });

  app.post("/addnewmonitor", isLoggedIn, (req, res) => {
    var optionsNewMonitor = {
      method: "POST",
      url: `${auth.host}newMonitor?api_key=${auth.api_key}`,
      headers: {},
      formData: {
        api_key: auth.api_key,
        friendly_name: req.body.friendly_name,
        url: req.body.url,
        type: 3,
      },
    };
    const newClientes = async () => {
      try {
        Pinguptimerobot.findOne(
          { "local.friendly_name": req.body.friendly_name },
        async  function (err, usuario) {
           // console.log("usuario", usuario);
            if (err) {
              return done(err);
            }
            if (usuario) {
              res.render("addnewmonitor", {
                message: "The friendly_name is already taken",
                user: req.user,
              });
              console.log("not added the new monitor friendly_name error");
            } else {

              const obj = await   request(optionsNewMonitor).json();
             


              if (obj.stat != "fail") {
                var newPing = new Pinguptimerobot();

                newPing.local.username = req.user.local.name;
                newPing.local.friendly_name = req.body.friendly_name;
                newPing.local.url = req.body.url;
                newPing.local.id =0;
                newPing.local.created = new Date().toString();
                newPing.local.updated = new Date().toString();
                  newPing.local.status = "Down";
               
             
                newPing.local.type_ = 3;

                newPing.save(function (err) {
                  if (err) {
                    throw err;
                  }
                });
                res.render("userSpace", { user: req.user });
                console.log("addnewmonitor post");
              } else {
                console.log("usuario", usuario);
                res.render("addnewmonitor", {
                  message: "The url is already taken",
                  user: req.user,
                });
                console.log("not added the new monitor url error");
              }

            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    newClientes();

    funcionChecking(req, res);
  });

  app.get("/losscalculator", isLoggedIn, async (req, res) => {
   
   try {
    option = {
      "local.username": req.user.local.name,
    };
    const numeroTiendas = await Pinguptimerobot.find(option);
    
   
    res.render("losscalculator", { user: req.user,numeroTiendas:numeroTiendas.length });
   
   } catch (error) {
    console.log(error);
   }
   console.log("losscalculator get");
  });

  app.post("/losscalculator", async (req, res) => {
    try {
      option = {
        "local.username": req.body.username,
        "local.friendly_name": req.body.friendly_name,
      };

      const cursor = await Pinguptimerobot.find(option);

      const EscalaBase = escalaBase(cursor);
      const EscalaMinutos = escalaMinutos(EscalaBase);
      var ingresosPorAnio = parseFloat(req.body.income);

      var ingresosPorMinutos = ingresosPorAnio / (365 * 24 * 60);
      var minutosPorPeriodo = EscalaMinutos.length;
      var TotalDownTimeMinutes =
        EscalaMinutos[EscalaMinutos.length - 1].downTimeMinutes;
      if (minutosPorPeriodo != 0) {
        var numPeriodosPorAnio = (365 * 24 * 60) / minutosPorPeriodo;
        var perdidasPorPeriodo = TotalDownTimeMinutes * ingresosPorMinutos;
        var perdidasEstimadasPorAnio = numPeriodosPorAnio * perdidasPorPeriodo;
        var ingresosEstimados = ingresosPorAnio + perdidasEstimadasPorAnio;
      } else {
        var perdidasPorPeriodo = 0;
        var perdidasEstimadasPorAnio = 0;
        var ingresosEstimados = ingresosPorAnio;
      }

      console.log("ingresosPorAnio", ingresosPorAnio);
      console.log("minutosPorPeriodo", minutosPorPeriodo);
      console.log("TotalDownTimeMinutes", TotalDownTimeMinutes);
      console.log("numPeriodosPorAnio", numPeriodosPorAnio);
      console.log("perdidasPorPeriodo", perdidasPorPeriodo);
      console.log("perdidasEstimadasPorAnio", perdidasEstimadasPorAnio);
      console.log("ingresosEstimados", ingresosEstimados);

      res.render("losscalculator2", {
        user: req.user,
        calculo: perdidasPorPeriodo,
        ingresosEstimados: ingresosEstimados,
        totalMinutosDown: TotalDownTimeMinutes,
        minutosPorPeriodo: minutosPorPeriodo,
      });
      console.log("losscalculator post");
    } catch (error) {
      console.log(error);
    }
  });

  app.get(
    "/statusCober/:nombreTienda/:scale/:pos",
    isLoggedIn,
    async (req, res) => {
      try {
        var nombreTienda = req.params.nombreTienda;

        option = {
          "local.username": req.user.local.name,
          "local.friendly_name": nombreTienda,
        };

        const cursor = await Pinguptimerobot.find(option);
        const EscalaBase = escalaBase(cursor);
        const EscalaMinutos = escalaMinutos(EscalaBase);

        var lista = [];
        if (req.params.scale == "minutes") {
          lista = adecuadarListaMinutos(
            escalaHorasMejorada(EscalaMinutos),
            escalaMinutos(EscalaBase),
            req.params.pos
          );
        } else if (req.params.scale == "hours") {
          lista = adecuadarListaHoras(
            escalaDiasMejorado(EscalaMinutos),
            escalaHorasMejorada(EscalaMinutos),
            req.params.pos
          );
        } else {
          lista = escalaDiasMejorado(EscalaMinutos);
        }
        res.render("statusCober", {
          lista: lista,
          user: req.user,
          friendly_name: nombreTienda,
          scale: lista[0].scale,
        });
        console.log("/statusCober/:nombreTienda/:scale");
      } catch (error) {
        console.log(error);
      }
    }
  );

  app.get("/statusCober", isLoggedIn, async (req, res) => {
    const listaA = [{ day: 0, iDownTime: "", downTimeCounter: 0 }];
    try {
      option = {
        "local.username": req.user.local.name,
        "local.friendly_name": "cober",
      };

      const cursor = await Pinguptimerobot.find(option);
      const tiempoInicial = Date.parse(cursor[0].local.created);
      const EscalaBase = escalaBase(cursor);
      const listaHora = listaHoras(listaMinuto);
      const listaDia = listaDias(listaHora);
      console.log(listaMinuto);
      console.log(listaHora);
      console.log(listaDia);

      res.render("statusCober", { lista: listaHora, user: req.user });
      console.log("statusCober");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/listaMonitorCober", isLoggedIn, async (req, res) => {
    try {
      option = { "local.username": req.user.local.name };

      const cursor = await Pinguptimerobot.find(option);
      const lista = EliminarDuplicadoFriendlyNameConUsername(cursor);
      res.render("listaMonitorCober", { lista: lista, user: req.user });
      console.log("listaMonitorCober");
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/listaMonitorCober", isLoggedIn, async (req, res) => {
    try {
      option = {
        "local.username": req.user.local.name,
        "local.friendly_name": req.body.friendly_name,
      };

      const cursor = await Pinguptimerobot.find(option);

      const EscalaBase = escalaBase(cursor);
      const listaHora = listaHoras(listaMinuto);
      const listaDia = listaDias(listaHora);
      console.log(listaMinuto);
      console.log(listaHora);
      console.log(listaDia);

      res.render("statusCober", {
        lista: listaHora,
        user: req.user,
        friendly_name: req.body.friendly_name,
      });
      console.log("statusCober");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/logoutCober", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/home");
    });
  });

  app.get("/notifications", isLoggedIn, async (req, res) => {
    try {
      const lista = await notificationsList(Notifications, req.user.local.name);
      res.render("notifications", { lista: lista, user: req.user });
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/deletePingUser", isLoggedIn, async (req, res) => {
    try {
      option = { "local.username": req.user.local.name };
      //  const cursor = await Pinguptimerobot.find(option).sort({'_id': -1}).limit(1) ;
      //const info =  await cursor.toArray() ;
      const cursor = await Pinguptimerobot.find(option);
      const lista = EliminarDuplicadoFriendlyNameConUsername(cursor);
      res.render("deletePingUser", { lista: lista, user: req.user });
      console.log("deletePingUser");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/deletePingUser/:friendly_name", isLoggedIn, async (req, res) => {
    try {
      var resultado = [];
      resultado = await deletePingUserMejorada(
        Notifications,
        Pinguptimerobot,
        req.user.local.name,
        req.params.friendly_name
      );
      res.render("deletePingUserResults", {
        resultado: resultado,
        user: req.user,
      });

      console.log(
        " app.post resultado.ok, resultado.mensaje",
        resultado[0],
        resultado[1]
      );
      console.log("deletePingUser");
    } catch (error) {
      console.log(error);
    }
  });
  //------------------------------------------------------User space End-------------------------------------------------

  //------------------------------------------------------Admin space ----------------------------------------------------

  app.get("/adminSignupCober", (req, res) => {
    var username = "";
    if (req.isAuthenticated()) {
      username = req.user.local.name;
    }

    res.render("adminSignupCober", {
      message: req.flash("signupMessage"),
      username: username,
    });
    console.log("adminSignupCober");
  });

  app.post(
    "/adminSignupCober",
    passport.authenticate("admin-signup", {
      successRedirect: "/home",
      failureRedirect: "adminSignupCober",
      failureFlash: true,
    })
  );

  app.get("/adminLoginCober", (req, res) => {
    res.render("adminLoginCober", {
      message: req.flash("loginMessage"),
    });
    console.log("adminLoginCober");
  });

  app.post(
    "/adminLoginCober",
    passport.authenticate("admin-login", {
      successRedirect: "/adminSpace",
      failureRedirect: "loginCober",
      failureFlash: true,
    })
  );

  app.get("/adminSpace", isLoggedIn, (req, res) => {
    try {
      if (req.user.local.admin) {
        res.render("adminSpace", {
          user: req.user,
        });
      } else {
        res.render("adminLoginCober", {
          message: req.flash("adminloginMessage"),
        });
      }

      console.log("adminSpace");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/adminListaCober", isLoggedIn, async (req, res) => {
    try {
      option = { "local.username": req.user.local.name };
      const cursor = await Pinguptimerobot.find();
      const lista = EliminarDuplicadoFriendlyNameConUsername(cursor);

      console.log("lista", lista);
      res.render("adminListaCober", { lista: lista, user: req.user });
      console.log("adminListaCober");
    } catch (error) {
      console.log(error);
    }
  });

  app.get(
    "/statusCober/:username/:friendly_name/:scale/:pos",
    isLoggedIn,
    async (req, res) => {
      try {
        option = {
          "local.username": req.params.username,
          "local.friendly_name": req.params.friendly_name,
        };
        // const cursor = await Pinguptimerobot.find(option).sort({'_id': 1}).limit(1) ;
        //const info =  await cursor.toArray() ;
        const cursor = await Pinguptimerobot.find(option);

        const EscalaBase = escalaBase(cursor);
        const EscalaMinutos = escalaMinutos(EscalaBase);

        var lista = [];
        if (req.params.scale == "minutes") {
          lista = adecuadarListaMinutos(
            escalaHorasMejorada(EscalaMinutos),
            escalaMinutos(EscalaBase),
            req.params.pos
          );
        } else if (req.params.scale == "hours") {
          lista = adecuadarListaHoras(
            escalaDiasMejorado(EscalaMinutos),
            escalaHorasMejorada(EscalaMinutos),
            req.params.pos
          );
        } else {
          lista = escalaDiasMejorado(EscalaMinutos);
        }
        res.render("statusCober", {
          lista: lista,
          user: req.user,
          friendly_name: req.params.friendly_name,
          scale: lista[0].scale,
          username: req.params.username,
        });
        console.log("/statusCober/:username/:friendly_name");
      } catch (error) {
        console.log(error);
      }
    }
  );

  app.post("/adminListaCober", isLoggedIn, async (req, res) => {
    try {
      option = {
        "local.username": req.body.username,
        "local.friendly_name": req.body.friendly_name,
      };
      // const cursor = await Pinguptimerobot.find(option).sort({'_id': 1}).limit(1) ;
      //const info =  await cursor.toArray() ;
      const cursor = await Pinguptimerobot.find(option);

      const EscalaBase = escalaBase(cursor);
      const listaHora = listaHoras(listaMinuto);
      const listaDia = listaDias(listaHora);
      console.log(listaMinuto);
      console.log(listaHora);
      console.log(listaDia);

      res.render("statusCober", {
        lista: listaHora,
        user: req.user,
        friendly_name: req.body.friendly_name,
      });
      console.log("adminListaMonitorCober");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/adminDeletePing", isLoggedIn, async (req, res) => {
    try {
      const cursor = await Pinguptimerobot.find();
      const lista = EliminarDuplicadoFriendlyNameConUsername(cursor);
      res.render("adminDeletePing", { lista: lista, user: req.user });
      console.log("adminDeletePing");
    } catch (error) {
      console.log(error);
    }
  });

  app.get(
    "/adminDeletePing/:username/:friendly_name",
    isLoggedIn,
    async (req, res) => {
      try {
        var resultado = [];
        resultado = await deletePingUserMejorada(
          Notifications,
          Pinguptimerobot,
          req.params.username,
          req.params.friendly_name
        );
        res.render("adminDeletePingResults", {
          resultado: resultado,
          user: req.user,
        });

        console.log(
          " app.post resultado.ok, resultado.mensaje",
          resultado[0],
          resultado[1]
        );
        console.log("/adminDeletePing/:username/:friendly_name");
      } catch (error) {
        console.log(error);
      }
    }
  );

  app.get("/adminDeleteUser", isLoggedIn, async (req, res) => {
    try {
      const cursor = await Pinguptimerobot.find();
      const lista = EliminarDuplicadoFriendlyNameConUsername(cursor);
      res.render("adminDeleteUser", { lista: lista, user: req.user });
      console.log("adminDeleteUser");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/adminDeleteUser/:username", isLoggedIn, async (req, res) => {
    try {
      var resultado = [];
      resultado = await removeUser(
        Notifications,
        Pinguptimerobot,
        user,
        req.params.username
      );
      res.render("adminDeleteUserResults", {
        resultado: resultado,
        user: req.user,
      });

      console.log(
        " app.post resultado.ok, resultado.mensaje",
        resultado.ok,
        resultado.ok
      );
      console.log("/adminDeleteUser/:username/:friendly_name");
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/adminNotifications", isLoggedIn, async (req, res) => {
    try {
      const lista = await allNotificationsList(Notifications);
      res.render("adminNotifications", { lista: lista, user: req.user });
    } catch (error) {
      console.log(error);
    }
  });
  //------------------------------------------------------Admin space End-------------------------------------------------

  app.get("/home", (req, res) => {
    var autenticado = 0;
    if (req.isAuthenticated()) {
      if (req.user.local.admin) {
        autenticado = 1;
      } else {
        autenticado = 2;
      }
    }

    res.render("home", { autenticado: autenticado, user: req.user });
  });

  app.get("/", (req, res) => {
    var autenticado = 0;
    if (req.isAuthenticated()) {
      if (req.user.local.admin) {
        autenticado = 1;
      } else {
        autenticado = 2;
      }
    }

    res.render("home", { autenticado: autenticado, user: req.user });
  });

  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/home");
    });
  });

  app.get("/check", function (req, res) {
    funcionChecking(req, res);
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/home");
  }
}

function lastUpdateClientStatus(lista) {
  var last = lista[0];
  var status = lista[0].status;
  if (lista.length > 1) {
    for (let i = 1; i < lista.length; i++) {
      if (
        new Date(lista[i].updated).getTime() > new Date(last.updated).getTime()
      ) {
        last = lista[i];
        status = lista[i].status;
      }
    }
    console.log("lastUpdateClientStatus last", last);
    console.log("lastUpdateClientStatus status", status);
  }

  return status;
}
