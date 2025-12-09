const Coach = require('./Coach');
const UserDao = require('../model/UserDao');

const CoachController = {
  async createAccount(req, res) {
    try {
      const coach = new Coach();
      coach.userInput = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        username: req.body.username,
        permission: parseInt(req.body.permission, 10),
      };
      await UserDao.create(coach.userInput);
      res.status(201).json({ message: "Coach account created.", coach: coach.userInput });
    } catch (err) {
      res.status(500).json({ error: "Failed to create coach account", details: err.message });
    }
  },

  async viewAccount(req, res) {
    try {
      const { email } = req.body;
      const user = await UserDao.findLogin(email);
      if (user) {
        res.status(200).json({ message: "Account Info", user });
      } else {
        res.status(404).json({ message: "Account not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve account", details: err.message });
    }
  },

  async updateAccount(req, res) {
    try {
      const { email, field, value } = req.body;
      const user = await UserDao.findLogin(email);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      const updates = { [field]: value };
      const updatedUser = await UserDao.update(user._id, updates);
      res.status(200).json({ message: "Account updated", updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed to update account", details: err.message });
    }
  },

  async deleteAccount(req, res) {
    try {
      const { email } = req.body;
      const user = await UserDao.findLogin(email);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      await UserDao.del(user._id);
      res.status(200).json({ message: "Account deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete account", details: err.message });
    }
  },
};

module.exports = CoachController;
