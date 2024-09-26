const service = require('./service');
const oesService = require('../../components/oesService')

module.exports = {
  //
  // User
  //
  list: async (req, res, next) => {
    try {
      const response = await service.list(req.query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const response = await service.create(req.kauth.grant.access_token, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  read: async (req, res, next) => {
    try {
      const response = await service.readSafe(req.params.userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const response = await service.update(req.params.userId, req.body, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  //
  // User Preferences
  //
  deleteUserPreferences: async (req, res, next) => {
    try {
      await service.deleteUserPreferences(req.currentUser);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  readUserPreferences: async (req, res, next) => {
    try {
      const response = await service.readUserPreferences(req.currentUser);
      res.status(200).json({
        forms: response,
        preferences: {},
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserPreferences: async (req, res, next) => {
    try {
      const response = await service.updateUserPreferences(req.currentUser, req.body);
      res.status(200).json({
        forms: response,
        preferences: {},
      });
    } catch (error) {
      next(error);
    }
  },

  //
  // User Form Preferences
  //
  deleteUserFormPreferences: async (req, res, next) => {
    try {
      await service.deleteUserFormPreferences(req.currentUser, req.params.formId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  readUserFormPreferences: async (req, res, next) => {
    try {
      const response = await service.readUserFormPreferences(req.currentUser, req.params.formId);
      res.status(200).json(response || {});
    } catch (error) {
      next(error);
    }
  },

  updateUserFormPreferences: async (req, res, next) => {
    try {
      const response = await service.updateUserFormPreferences(req.currentUser, req.params.formId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  getUserOESData: async (req, res, next) => {
    try {
      const response = await oesService.getUserData(req.kauth.grant.access_token.token);
      res.status(200).json(response || {});
    } catch (error) {
      next(error);
    }
  },
};
