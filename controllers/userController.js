const User = require("../models/userModel");
const Form = require("../models/formModel");
const bcrypt = require("bcrypt");
const Settings = require("../models/userSettings");

//rabbitmq connection
const amqplib = require("amqplib");
let channel, connection;

connect();

// connect to rabbitmq
async function connect() {
  try {
    // rabbitmq default port is 5672
    const amqpServer =
      "amqps://gcojgcij:vn1d4yTk3KJTMVa__Szb2-ak0bEyihTI@woodpecker.rmq.cloudamqp.com/gcojgcij";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue("orders");
  } catch (error) {
    console.log(error);
  }
}

const getUser = async (req, res) => {
  const _id = req.params.id;
  try {
    const form = await Form.findOne({ user_id: _id });
    const user = await User.findById({ _id });
    if (!user) {
      return res.status(400).json({ error: "no such user" });
    }
    res.status(200).json({ user, form });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findOneAndDelete({ _id });
    if (!user) {
      return res.status(400).json({ error: "no such user" });
    }
/*     const data = { code: 2, email: user.email };
    channel.sendToQueue(
      "orders",
      Buffer.from(
        JSON.stringify({
          ...data,
          date: new Date(),
        })
      )
    ); */
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editUser = async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.updateOne({ _id }, { ...req.body });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  const _id = req.params.id;
  const { password } = req.body;
  const user = await User.findOne({ _id });
  if (!user) {
    throw Error("user not exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const newpassword = await User.findByIdAndUpdate(_id, { password: hash });
    const data = { code: 4, email: user.email };
    /*channel.sendToQueue(
          'orders',
          Buffer.from(
            JSON.stringify({
              ...data,
              date: new Date(),
            }),
          ),
        )*/
    res.status(200).json(newpassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkPassword = async (req, res) => {
  const _id = req.params.id;
  const { password } = req.body;
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw Error("user not exist");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error("incorrect password");
    }

    res.status(200).json("password ok");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editSettings = async (req, res) => {
  const _id = req.params.id;
  const user = await User.findOne({ _id });
  if (!user) {
    throw Error("user not exist");
  }
  try {
    const settings = await Settings.findOneAndUpdate(
      { user_id: _id },
      { $set: req.body }
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserSettings = async (req, res) => {
  const _id = req.params.id;
  try {
    const settings = await Settings.findOne({ user_id: _id });
    if (!settings) {
      return res.status(400).json({ error: "no such usersettings" });
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUser,
  deleteUser,
  editUser,
  changePassword,
  checkPassword,
  editSettings,
  getUserSettings,
};
