const User = require('./../models/user');
const Joi = require('joi');
const userController = {
  login: (req, res) => {
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }).validate(req.body).then(() => {
      passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
          // return res.status(400).json({ message: info.message });
          return res.status(400).json({ message: info ? info.message : 'Kredensial tidak valid' });
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Terjadi kesalahan saat login.' });
          }
          redisClient.set(`user:${user.id}`, JSON.stringify(user), 'EX', 3600, (redisErr) => {
            if (redisErr) {
              console.error('Gagal menyimpan data di Redis:', redisErr);
            }
          });
          user.dataValues.token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
          return res.status(200).json(user);
        });
      })(req, res, next);
    }).catch((valErr) => {
      return res.status(400).json(valErr);
    });
  },
  register: async (req, res) => {
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }).validate(req.body).then(async () => {
      const { name, email, password, role } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      try {
        User.create({ name: name, email: email, password: hashedPassword, role: role, value: 0 })
      } catch (error) {
        console.error('Error Membuat User Baru: ', error);
        res.status(500).json({ message: 'Error Membuat User Baru', error });
      }
    }).catch((valErr) => {
      return res.status(400).json(valErr);
    });
  },
  getAuthUser: async (req, res) => {
    const authenticatedUser = req.user;
    res.json(authenticatedUser);
  },
  updateAuthUser: async (req, res) => {
    const updatedData = req.body;
    try {
      const [updatedRowCount, updatedUsers] = await User.update(updatedData, {
        where: { id: req.user.id },
        returning: true
      });
      if (updatedRowCount === 0) {
        res.status(404).json({ message: 'Dia ngga ada bang' });
      } else {
        res.json(updatedUsers[0]);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error minta data users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Dia ngga ada masbro' });
      }
    } catch (error) {
      console.error('Error minta data user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  getUserByEmail: async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.params.email } });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Dia ngga ada masbro' });
      }
    } catch (error) {
      console.error('Error minta data user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  deleteUserById: async (req, res) => {
    try {
      if(req.user.id != req.body.id) {
        const user = await User.destroy({ where: { id: req.params.id } });
        if (user) {
          res.status(200).json({ message: 'Dia udah diusir masbro' });
        } else {
          res.status(404).json({ message: 'Dia emang udah ngga ada masbro' });
        }
      } else {
        res.status(401).json({ message: 'Lu kaga bisa ngapus diri sendiri masbro' });
      }
    } catch (error) {
      console.error('Error delete user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  deleteUserByEmail: async (req, res) => {
    try {
      if(req.user.email != req.body.email) {
        const user = await User.destroy({ where: { email: req.params.email } });
        if (user) {
          res.status(200).json({ message: 'Dia udah diusir masbro' });
        } else {
          res.status(404).json({ message: 'Dia emang udah ngga ada masbro' });
        }
      } else {
        res.status(401).json({ message: 'Lu kaga bisa ngapus diri sendiri masbro' });
      }
    } catch (error) {
      console.error('Error delete user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = userController;