// DECLARE EXPRESSJS
const express = require('express');
const app = express();

// DECLARE CONTROLLERS
const userController = require('./controllers/userController');

// DECLARE REDIS
const redis = require('ioredis');

// DECLARE SEQUELIZE DATABASE
const db = require('./models');

// DECLARE PASSPORT AUTH JSON WEBTOKEN BEARER SCHEMA
const passport = require('passport');
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

// GROUPING AUTHENTICATED ROUTES
app.use('/auth', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(404).json({ message: 'Lah kaga ada user bang' });
  }
});

// CRUD USERS
app.post('/login', userController.login);
app.post('/auth/create/user', userController.register);
app.get('/auth/me', userController.getAuthUser);
app.put('/auth/me/update', userController.updateAuthUser);
app.get('/auth/users', userController.getUsers);
app.get('/auth/users/:id', userController.getUserById);
app.get('/auth/users/email/:email', userController.getUserByEmail);
app.delete('/auth/users/delete/:id', userController.deleteUserById);
app.delete('/auth/users/delete/email/:email', userController.deleteUserByEmail);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});