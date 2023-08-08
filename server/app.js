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
db.sequelize.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Error syncing database: ', err);
  });

// CONFIGURE PASSPORT
app.use(passport.initialize());
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'Email tidak ditemukan.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Password salah.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  new JwtStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey,
  }, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      console.log(user);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

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
app.get('/users/:id', userController.getUserById);
app.get('/users/email/:email', userController.getUserByEmail);
app.delete('/users/delete/:id', passport.authenticate('jwt', { session: false }), userController.deleteUserById);
app.delete('/users/delete/email/:email', passport.authenticate('jwt', { session: false }), userController.deleteUserByEmail);

// CRUD GROUPS
app.get('/groups', groupController.getGroups);
app.post('/create/group', groupController.createGroup);
app.post('/update/group', groupController.updateGroup);
app.delete('/delete/group/:id', passport.authenticate('jwt', { session: false }), groupController.deleteGroup);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});