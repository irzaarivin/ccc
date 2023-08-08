const { Group } = require('./../models');
const Joi = require('joi');

// CONTROLLER
const groupController = {
  
  getGroups: (req, res) => {
    Group.findAll()
      .then(groups => res.json(groups))
      .catch(err => res.status(400).json('Error: ' + err));
  },
  createGroup: (req, res) => {
    const { error } = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      member: Joi.string().required()
    }).validate(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    Group.create({
      name: req.body.name,
      description: req.body.description,
      member: req.body.member
    }).then(() => {
      res.status(201).json({ message: 'Group berhasil dibuat.' });
    }).catch((error) => {
      res.status(500).json({ message: 'Internal server error', error });
    })
  },
  updateGroup: (req, res) => {
    const { error } = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      member: Joi.string().required()
    }).validate(req.body);
    if (error) {
      return res.status(400).json(error);
    }
    Group.update({
      name: req.body.name,
      description: req.body.description,
      member: req.body.member
    }).then(() => {
      res.status(201).json({ message: 'Group berhasil diupdate.' });
    }).catch((error) => {
      res.status(500).json({ message: 'Internal server error', error });
    })
  },
  deleteGroup: (req, res) => {
    Group.destroy({
      where: {
        id: req.params.id
      }
    }).then(() => {
      return res.status(200).json({ message: 'Group berhasil dihapus.' });
    }).catch((error) => {
      return res.status(500).json({ message: 'Internal server error', error });
    })
  }
  
}

module.exports = groupController;