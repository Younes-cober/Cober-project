const request = require("request");

const Pinguptimerobot = require("../app/models/ping");
const Notifications = require("../app/models/notifications");

const { use } = require("passport");
const dotenv = require("dotenv");
dotenv.config();

var listaTiendas = [];
var listaTiendasDB = [];
var listaFriendlyNameApi = [];

var auth = {
  api_key: process.env.API_KEY,
  host: process.env.HOST,
};
var optionsListMonitor = {
  method: "POST",
  url: `${auth.host}getMonitors?api_key=${auth.api_key}`,
  headers: {},
};

const jsonfile = {
  local: [
    {
      username: "Younes",
      friendly_name: "youtube",
      created: "Tue Dec 06 2022 13:22:47 GMT+0100",
      updated: "Tue Dec 06 2022 13:22:47 GMT+0100",
      status: "Up",
    },

    {
      username: "Younes",
      friendly_name: "youtube",
      created: "Tue Dec 06 2022 13:30:47 GMT+0100",
      updated: "Tue Dec 06 2022 13:30:47 GMT+0100",
      status: "Down",
    },

    {
      username: "Younes",
      friendly_name: "youtube",
      created: "Tue Dec 06 2022 13:50:47 GMT+0100",
      updated: "Tue Dec 06 2022 13:50:47 GMT+0100",
      status: "Up",
    },

    {
      username: "Younes",
      friendly_name: "youtube",
      created: "Tue Dec 06 2022 13:55:47 GMT+0100",
      updated: "Tue Dec 06 2022 13:55:47 GMT+0100",
      status: "Down",
    },
    {
      username: "Younes",
      friendly_name: "youtube",
      created: "Tue Dec 06 2022 14:55:47 GMT+0100",
      updated: "Tue Dec 06 2022 14:55:47 GMT+0100",
      status: "Up",
    },
  ],
};

module.exports = {
  adecuadarListaMinutos(hoursScaleList, minutesScaleList, pos) {
    var listaOut = [];
    if (hoursScaleList.length != 0 && pos >= 0) {
      const fecha = hoursScaleList[pos - 1].fecha;
      const hora = new Date(fecha).getHours();
      const day = new Date(fecha).getDate();
      console.log("hora", hora);

      listaOut = minutesScaleList.filter(
        (minuto) =>
          new Date(minuto.fecha).getHours() == hora &&
          new Date(minuto.fecha).getDate() == day
      );
      console.log("listaOut", listaOut);
    } // Empty list
    else {
      listaOut = minutesScaleList;
    }
    return listaOut;
  },
  adecuadarListaHoras(daysScaleList, hoursScaleList, pos) {
    var listaOut = [];
    if (daysScaleList.length != 0 && pos >= 0) {
      const fecha = daysScaleList[pos - 1].fecha;
      const day = new Date(fecha).getDate();
      listaOut = hoursScaleList.filter(
        (hora) => new Date(hora.fecha).getDate() == day
      );
    } // Empty list
    else {
      listaOut = hoursScaleList;
    }
    return listaOut;
  },

  EliminarDuplicadoFriendly_name(lista) {
    const l1 = [];
    for (let i = 0; i < lista.length; i++) {
      l1.push(lista[i].local.friendly_name);
    }
    const dataArr = new Set(l1);
    let result = [...dataArr];
    return result;
  },

  EliminarDuplicadoFriendlyNameConUsername(lista) {
    const l1 = [];
    const l2 = [];
    for (let j = 0; j < lista.length; j++) {
      l2.push(lista[j].local.friendly_name);
    }
    const dataArr = new Set(l2);
    let result = [...dataArr];

    let ii = 0;
    for (let i = 0; i < result.length; i++) {
      var lastUpdate = lista[0].local.created;
      var lastStatus = lista[0].local.status;
      var lastUsername = lista[0].local.username;
      var lastFriendly_name = lista[0].local.friendly_name;
      while (ii < lista.length) {
        if (result[i] === lista[ii].local.friendly_name) {
          if (
            new Date(lista[ii].local.created).getTime() >=
            new Date(lastUpdate).getTime()
          ) {
            lastUpdate = lista[ii].local.created;
            lastStatus = lista[ii].local.status;
            lastUsername = lista[ii].local.username;
            lastFriendly_name = lista[ii].local.friendly_name;
          }
        }
        ii = ii + 1;
      }
      l1.push({
        friendly_name: lastFriendly_name,
        username: lastUsername,
        status: lastStatus,
      });
      ii = 0;
    }
    return l1;
  },

  escalaBase(listaEstados) {
    const listaMinutos = [];
    var contadorMinutos = 0;
    for (let i = 0; i < listaEstados.length; i++) {
      if (i < listaEstados.length - 1) {
        const ini = new Date(listaEstados[i].local.created).getTime();
        const fin = new Date(listaEstados[i + 1].local.created).getTime();
        const numMinTotal = Math.round((fin - ini) / (1000 * 60));
        for (let ii = 0; ii < numMinTotal; ii++) {
          listaMinutos.push({
            status: listaEstados[i].local.status,
            minuto: contadorMinutos,
            fechaInicial: listaEstados[0].local.created,
          });
          contadorMinutos = contadorMinutos + 1;
        }
      } else {
        const ini = new Date(listaEstados[i].local.created).getTime();
        const ahoraGmt = new Date().toString();
        const fin = new Date(ahoraGmt).getTime();
        const numMinTotal = Math.round((fin - ini) / (1000 * 60));
        for (let ii = 0; ii < numMinTotal; ii++) {
          listaMinutos.push({
            status: listaEstados[i].local.status,
            minuto: contadorMinutos,
            fechaInicial: listaEstados[0].local.created,
          });
          contadorMinutos = contadorMinutos + 1;
        }
      }
    }

    return listaMinutos;
  },

  downUpTime(lista) {
    var conDown = 0,
      conUp = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].local.status === "Up") {
        conUp = conUp + 1;
      } else {
        conDown = conDown + 1;
      }
    }
    const total = conDown + conUp;
    conDown = conDown * (100 / total);
    conUp = conUp * (100 / total);
    return { conUp: conUp, conDown: conDown };
  },

  listaHoras(lista) {
    const listaH = [];
    var contadorMinutos = 0;
    var contadorHoras = 1;
    var conDown = 0,
      conUp = 0;

    for (let i = 0; i < lista.length; i++) {
      if (contadorMinutos < 60) {
        if (lista[i].status === "Up") {
          conUp = conUp + 1;
        } else {
          conDown = conDown + 1;
        }
        contadorMinutos = contadorMinutos + 1;
      } else {
        const total = conDown + conUp;
        conDown = conDown * (100 / total);
        conUp = conUp * (100 / total);
        listaH.push({ status: conUp.toFixed(2), hora: contadorHoras });
        contadorMinutos = 0;
        (conDown = 0), (conUp = 0);
        contadorHoras = contadorHoras + 1;
      }
    }
    return listaH;
  },

  listaDias(lista) {
    const listaH = [];
    var contadorDias = 1;
    var contadorHoras = 1;
    var conDown = 0,
      conUp = 0;
    for (let i = 0; i < lista.length; i++) {
      if (contadorHoras < 24) {
        if (lista[i].status === "100.00") {
          conUp = conUp + 1;
        } else {
          conDown = conDown + 1;
        }
        contadorHoras = contadorHoras + 1;
      } else {
        const total = conDown + conUp;
        conDown = conDown * (100 / total);
        conUp = conUp * (100 / total);
        listaH.push({ status: conUp.toFixed(2), dia: contadorDias });
        contadorHoras = 0;
        (conDown = 0), (conUp = 0);
        contadorDias = contadorDias + 1;
      }
    }
    return listaH;
  },

  escalaMinutos(lista) {
    const listaM = [];

    var fecha = "";
    var conUp = 0.0;
    var contadorDownTime = 0;
    if (lista.length != 0) {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].status === "Up") {
          conUp = 100.0;
        } else {
          conUp = 0.0;
          contadorDownTime++;
        }
        fecha = new Date(
          new Date(lista[i].fechaInicial).getTime() +
            lista[i].minuto * 60 * 1000
        ).toString();
        listaM.push({
          status: conUp,
          minuto: lista[i].minuto,
          fechaInicial: lista[i].fechaInicial,
          fecha: fecha,
          scale: "minutes",
          downTimeMinutes: contadorDownTime,
        });
      }
    } else {
      listaM.push({
        status: 100.0,
        minuto: 0,
        fechaInicial: new Date().toString(),
        fecha: new Date().toString(),
        scale: "minutes",
        downTimeMinutes: 0.0,
      });
    }
    return listaM;
  },

  escalaHoras(lista) {
    const listaH = [];
    var contadorMinutos = 0;
    var contadorHoras = 1;
    var conUp = 0;
    var fecha = "";
    for (let i = 0; i < lista.length; i++) {
      if (contadorMinutos < 60) {
        conUp = conUp + lista[i].status;

        contadorMinutos = contadorMinutos + 1;
      } else {
        conUp = conUp / contadorMinutos;

        fecha = new Date(
          new Date(lista[i].fechaInicial).getTime() +
            lista[i].minuto * 60 * 1000
        ).toString();
        listaH.push({
          status: conUp.toFixed(2),
          hora: contadorHoras,
          fechaInicial: lista[i].fechaInicial,
          fecha: fecha,
          scale: "hours",
        });
        contadorMinutos = 0;
        conUp = 0;
        contadorHoras = contadorHoras + 1;
      }
    }
    return listaH;
  },

  escalaDias(lista) {
    const listaH = [];
    var contadorDias = 1;
    var conUp = 0;
    var contadorMinutos = 0;
    for (let i = 0; i < lista.length; i++) {
      if (contadorMinutos < 60 * 24) {
        conUp = conUp + lista[i].status;

        contadorMinutos++;
      } else {
        conUp = conUp / contadorMinutos;
        fecha = new Date(
          new Date(lista[i].fechaInicial).getTime() +
            lista[i].minuto * 60 * 1000
        ).toString();
        listaH.push({
          status: conUp.toFixed(2),
          dia: contadorDias,
          fechaInicial: lista[i].fechaInicial,
          fecha: fecha,
          scale: "days",
        });
        contadorDias++;
        contadorMinutos = 0;
        (conDown = 0), (conUp = 0);
      }
    }
    return listaH;
  },
  escalaDiasMejorado(lista) {
    const listaD = [];
    var contadorDias = 1;
    var conUp = 0;
    var diaActual = new Date(lista[0].fechaInicial).getDate();
    var contadorMinutos = 0;
    for (let i = 0; i < lista.length; i++) {
      if (diaActual === new Date(lista[i].fecha).getDate()) {
        conUp = conUp + lista[i].status;
        contadorMinutos++;
      } else {
        diaActual = new Date(lista[i].fecha).getDate();
        conUp = conUp / contadorMinutos;
        listaD.push({
          status: conUp.toFixed(2),
          dia: contadorDias,
          fechaInicial: lista[i].fechaInicial,
          fecha: lista[i - 1].fecha,
          scale: "days",
        });
        contadorDias++;
        contadorMinutos = 0;
        conUp = 0;
      }
    }
    conUp = conUp / contadorMinutos;
    listaD.push({
      status: conUp.toFixed(2),
      dia: contadorDias,
      fechaInicial: lista[0].fechaInicial,
      fecha: lista[lista.length - 1].fecha,
      scale: "days",
    });

    return listaD;
  },
  escalaHorasMejorada(lista) {
    const listaH = [];
    var contadorMinutos = 0;
    var contadorHoras = 1;
    var conUp = 0;
    var fecha = "";
    var horaActual = new Date(lista[0].fechaInicial).getHours();
    for (let i = 0; i < lista.length; i++) {
      if (horaActual === new Date(lista[i].fecha).getHours()) {
        conUp = conUp + lista[i].status;
        contadorMinutos = contadorMinutos + 1;
      } else {
        horaActual = new Date(lista[i].fecha).getHours();
        conUp = conUp / contadorMinutos;

        listaH.push({
          status: conUp.toFixed(2),
          hora: contadorHoras,
          fechaInicial: lista[i].fechaInicial,
          fecha: lista[i - 1].fecha,
          scale: "hours",
        });
        contadorMinutos = 0;
        conUp = 0;
        contadorHoras = contadorHoras + 1;
      }
    }
    conUp = conUp / contadorMinutos;
    listaH.push({
      status: conUp.toFixed(2),
      hora: contadorHoras,
      fechaInicial: lista[0].fechaInicial,
      fecha: lista[lista.length - 1].fecha,
      scale: "hours",
    });

    console.log("listaH", listaH);
    return listaH;
  },
  test() {
    console.log("estoy en funciones");
  },

  funcionChecking(req, res) {
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
              try {
                if (listaTiendasDB.length > 0) {
                  var lastupdatedStatus =
                    lastUpdateClientStatus(listaTiendasDB);
                  var l = listaTiendasDB;
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
                    console.log("estado", estado);
                    console.log("lastupdatedStatus", lastupdatedStatus);
                    console.log("l", l);
                    contadorDeCambios++;
                    var newPing = new Pinguptimerobot(); // creamos modelo de usuario

                    // var objectId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
                    // newPing._id= objectId;

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
                    var estado = newPing.local.status;
                    newPing.save(function (err) {
                      if (err) {
                        throw err;
                      }
                    });
                    addNotification(
                      Notifications,
                      estado,
                      obj.monitors[i].url,
                      user[0].local.username,
                      obj.monitors[i].friendly_name
                    );
                  }
                }
              } catch (error) {
                console.log("------>>>", error);
              }
            }
          );
        }
        console.log("checking");
        console.log("-------------->>");
        contadorDeCambios = 0;
      });

      //  res.render('checking', { lista: listaTiendasDB });
      listaTiendasDB = [];
      listaTiendas = [];
    } catch (error) {
      console.log(error);
    }
  },
  async notificationsList(notificationCollection, username) {
    option = { "local.username": username };
    return await notificationCollection.find(option);
  },
  async allNotificationsList(notificationCollection) {
    return await notificationCollection.find();
  },

  async deletePingUser(
    notificationCollection,
    pingCollection,
    username,
    friendly_name
  ) {
    const resultado = [];
    try {
      option = {
        "local.username": username,
        "local.friendly_name": friendly_name,
      };
      const lista = await pingCollection.find(option);
      var i = 0;
      var salir = false;
      var id = 0;

      while (i < lista.length && !salir) {
        if (lista[i].local.id != 0) {
          id = lista[i].local.id;
          salir = true;
        }
        i++;
      }

      // const element = lista.findOne((element) => element.local.id != 0)
      // id = element.local.id

      if (lista.length > 0 && id > 0) {
        var optionsDeleteMonitor = {
          method: "POST",
          url: `${auth.host}deleteMonitor?api_key=${auth.api_key}`,
          headers: {},
          formData: {
            api_key: auth.api_key,
            id: id,
          },
        };
        request(optionsDeleteMonitor, async (error, response) => {
          if (error) throw new Error(error);
          const obj = JSON.parse(response.body);
          console.log("obj.stat", obj.stat);
          if (obj.stat != "fail") {
            try {
              const res1 = await pingCollection.deleteMany(option);
              const res2 = await notificationCollection.deleteMany(option);
              resultado.push("1");
              resultado.push(
                `the friendly_name ${friendly_name} has been deleted successfully`
              );
              console.log(
                " 1 resultado.ok, resultado.mensaje",
                resultado[0],
                resultado[1]
              );
            } catch (error) {
              console.log("error", error);
              resultado.push("0");
              resultado.push(error);
            }
          } else {
            console.log("obj.stat", obj.stat);
            resultado.push("0");
            resultado.push('obj.stat == "fail"');
          }
        });
      } else {
        console.log("id-->>>", id);
      }
    } catch (error) {
      //console.log(error);
      resultado.push(error.toString());
    }

    return resultado;
  },
  async deletePingUserMejorada(
    notificationCollection,
    pingCollection,
    username,
    friendly_name
  ) {
    const resultado = [];
    try {
      option = {
        "local.username": username,
        "local.friendly_name": friendly_name,
      };
      const lista = await pingCollection.find(option);
      var i = 0;
      var salir = false;
      var id = 0;

      while (i < lista.length && !salir) {
        if (lista[i].local.id != 0) {
          id = lista[i].local.id;
          salir = true;
        }
        i++;
      }

      if (lista.length > 0) {
        var optionsDeleteMonitor = {
          method: "POST",
          url: `${auth.host}deleteMonitor?api_key=${auth.api_key}`,
          headers: {},
          formData: {
            api_key: auth.api_key,
            id: id,
          },
        };

        const obj = await request(optionsDeleteMonitor).json();
        console.log("--------> ", obj);
        if (obj.stat != "fail") {
          resultado.push("1");
          resultado.push(
            `the friendly_name ${friendly_name} has been deleted successfully`
          );
          const res1 = await pingCollection.deleteMany(option);
          const res2 = await notificationCollection.deleteMany(option);
          console.log(
            " new one resultado.ok, resultado.mensaje",
            resultado[0],
            resultado[1]
          );
        } else {
          resultado.push(obj.stat);
          console.log("obj.stat", obj.stat);
        }
      } else {
        console.log("id-->>>", id);
      }
    } catch (error) {
      console.log(error);
      resultado.push(error.toString());
    }
    return resultado;
  },
  async removeUser(Notifications, Pinguptimerobot, User, username) {
    const option = { "local.username": username };
    const optionUser = { "local.name": username };
    var results = { ok: false, message: "" };
    const listaPing = await Pinguptimerobot.find(option);
    const listaUser = await User.find(optionUser);

    if (listaPing.length > 0 && listaUser.length > 0) {
      const res1 = await Pinguptimerobot.deleteMany(option);
      const res2 = await Notifications.deleteMany(option);
      const res3 = await User.deleteOne(optionUser);
      results.ok = true;
      results.message = `the username ${username} has been removed successfully`;
    } else {
      results.message = `Error: Cannot delete username ${username}`;
    }
    return results;
  },
};

function lastUpdateClientStatus(lista) {
  if (lista.length > 0) {
    var last = lista[0];
    var status = lista[0].status;
    for (let i = 1; i < lista.length; i++) {
      if (
        new Date(lista[i].updated).getTime() > new Date(last.updated).getTime()
      ) {
        last = lista[i];
        status = lista[i].status;
      }
    }
  }
  return status;
}

function addNotification(
  notificationCollection,
  status,
  url,
  username,
  friendly_name
) {
  notificationCollection.findOne(
    { "local.friendly_name": friendly_name, "local.username": username },
    function (err, usuario) {
      console.log("usuario", usuario);
      if (err) {
        return done(err);
      }
      var newNotification = new notificationCollection();
      newNotification.local.username = username;
      newNotification.local.friendly_name = friendly_name;
      newNotification.local.url = url;
      newNotification.local.id = 0;
      newNotification.local.created = new Date().toString();
      newNotification.local.updated = new Date().toString();
      newNotification.local.status = status;
      if (usuario) {
        newNotification.local.numNotificatios = usuario.length;
      } else {
        newNotification.local.numNotificatios = 0;
      }
      newNotification.save(function (err) {
        if (err) {
          throw err;
        }
      });
    }
  );
}
