const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const request = require('request');
const dotenv = require('dotenv');
 dotenv.config();

const app = express();
const mongoose = require('mongoose');

const registrarPing = require('./config/logica');
const {test,funcionChecking} = require('./config/funciones');


mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true , useUnifiedTopology: true 
}).then(()=> console.log('conectado a mongodb')) 
.catch(e => console.log('error de conexión', e))


require('./config/passport')(passport);// configurar lo definimos en la configuracion  y le pasamos el modulo
                                       // passport que ya he  inicializado
// settings
app.set('port',process.env.PORT || 3000);//mi servidor va a tener un 'port' revisar si os tienes un puerto definido si no 
                                          // se conecta al puerto 3000
app.set('views',path.join(__dirname,'views'));// donde van a estar las vistas
app.set('view engine', 'ejs'); // motor de plantillas
// middlewares
app.use(morgan('dev')); // es la manera dpor la cual podemos ver los mensajes por consola configuracion de desarrollo
app.use(cookieParser()); // para administrar las cookis y convertirlas y interpretarlas
app.use(bodyParser.urlencoded({extended:false})); //la info que reciba del furmulario la puedo interpretar
                                                  // a través de la web url, extended:false porque no quiero 
                                                  // procesar imagenes ni nada parecido solo datos
app.use(session({
    secret: 'misecreto',
    resave:false, // para que no se guarde cada 0 tiempo
    saveUninitialized:false
}));

app.use(passport.initialize());// definir nos vamos a autenticar
app.use(passport.session()); // unir passport a la session es decir que cuando se 
                          // se autentica un usuario la informacion o se va a estar pidiendo 
                          //cada momento de la base de datos por eso que se guarda dentro del mismo nevegador
                          // y por eso necesitamos un modulo llamado session

app.use(flash());// pasar mensajes entre distintos paginas html, el modulo se llama connect-flash 
                // pero lo hemos guardado dentro de una constante llamada flash

// routes

require('./app/routes')(app,passport,request,registrarPing); // donde estas nuestras rutas, y le pasamos dos parametros
                                    // una es la aplicacion de express que hemos venido configurando
                                    // y agregando middelewares, también voy a pasarle passport
                                    // para porder utilizar autenticación dentro de estas rutas
                                    // luego se configuran las rutas en app/routes.js
// static files

app.use(express.static(path.join(__dirname,'public'))); // para indicar donde estaran nuestros archivos css
                                                        // archivos imagenes fuentes etc..
                                                        // es donde colocamos todos nuestros archivos estaticos


var intervalId = setInterval(function(req,res) {
    funcionChecking(req, res);
    
 }, 1000*60);
 
app.listen(app.get('port'),() => {
    console.log('server on port',app.get('port'));
});
