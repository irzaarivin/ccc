// DECLARE EXPRESSJS
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

// DECLARE CONTROLLERS
const userController = require('./controllers/userController');
const groupController = require('./controllers/groupController');

// DECLARE REDIS
const redis = require('ioredis');

// DECLARE SEQUELIZE DATABASE
const db = require('./models');
const User = db.User;

// DECLARE BODY PARSER
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// DECLARE PASSPORT AUTH JSON WEBTOKEN BEARER SCHEMA
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const secretKey = "sangat_very_secret_key_banget_sekali";

// Sinkronisasi model dengan database
db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((err) => {
  console.error('Error syncing database: ', err);
});

// CONFIGURE REDIS
// const redisClient = redis.createClient({
//   host: 'localhost',
//   port: 6379,
// });

// redisClient.on('error', (err) => {
//   console.error('Gagal terkoneksi ke Redis:', err);
// });

// CRUD USERS
app.post('/login', userController.login);
app.post('/create/user', passport.authenticate('jwt', { session: false }), userController.register);
app.get('/auth/me', passport.authenticate('jwt', { session: false }), userController.getAuthUser);
app.put('/auth/me/update', passport.authenticate('jwt', { session: false }), userController.updateAuthUser);
app.get('/users', userController.getUsers);
app.get('/users/filters', userController.getUsersByFilters);
app.get('/users/:id', userController.getUserById);
app.get('/users/email/:email', userController.getUserByEmail);
app.delete('/users/delete/:id', passport.authenticate('jwt', { session: false }), userController.deleteUserById);
app.delete('/users/delete/email/:email', passport.authenticate('jwt', { session: false }), userController.deleteUserByEmail);

// RUNNING SERVER
// CRUD GROUPS
app.get('/groups', groupController.getGroups);
app.post('/create/group', groupController.createGroup);
app.post('/update/group', groupController.updateGroup);
app.delete('/delete/group/:id', passport.authenticate('jwt', { session: false }), groupController.deleteGroup);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});