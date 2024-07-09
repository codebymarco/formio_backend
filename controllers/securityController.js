const User = require("../models/userModel");
const RecCode = require("../models/RecCode");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

const createUserRecoveryCode = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      throw Error("user does not exist");
    }

    const { password } = req.body;

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error("incorrect password");
    }

    const hash = crypto.randomUUID();

    const recoveryCodes = await RecCode.find({ user_id: id });

    const updatemany = await RecCode.updateMany(
      { user_id: id },
      {
        current: false,
      }
    );

    const recoverycode = await RecCode.create({
      code: hash,
      user_id: user._id,
      used: false,
      current: true,
    });

    res.status(200).json({ message: `new code generated`, recoverycode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserRecoveryCode = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      throw Error("user does not exist");
    }

    const recoverycode = await RecCode.findOne({
      user_id: user._id,
      current: true,
    });

    res.status(200).json({ recoverycode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserRecoveryCode,
  createUserRecoveryCode,
};
