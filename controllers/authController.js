const User = require("../models/userModel");
const UserSettings = require("../models/userSettings");
const PwdLessCode = require("../models/passwordlessSignupCode");
const TwoFactorCode = require("../models/twoFactorCode");
const RecCode = require("../models/RecCode");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Form = require("../models/formModel");
const crypto = require("crypto");

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

//createJwt token
//move to helpers file
const createToken = (_id) => {
  return jwt.sign({ _id }, "cm", { expiresIn: "300d" });
};

//post user
const createUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw Error("all fields must be filled");
    }

    const exists = await User.findOne({ email });

    if (exists) {
      throw Error("email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hash });
    const token = createToken(user._id);

    let fm = {
      bgcolor: "#f0f3ff",
      fontcolor: "#000000",
      inputbgcolor: "#ffffff",
      btncolor: "#000000",
      btntxtcolor: "#d8dbe9",
      inputtxtcolor: " #000000",
      name: "default",
      email: user.email,
      title: "default title",
      reply_email: false,
      reply_email_content: "",
      premium: true,
      namefield: true,
      emailfield: true,
      bodyfield: true,
      status: true,
      theme: 'ONE'
    };

    const form = await Form.create({
      user_id: user._id,
      ...fm,
    });
    console.log(form);

    const settings = await UserSettings.create({
      user_id: user._id,
      two_factor: false,
      passwordless: false,
    });
    console.log(form);

    /*const data = {code:1,email:user.email}
    channel.sendToQueue(
      'orders',
      Buffer.from(
        JSON.stringify({
          ...data,
          date: new Date(),
        }),
      ),
    )*/

        //add data to loginHistory


    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//signin user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw Error("all fields must be filled");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error("incorrect email");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error("incorrect password");
    }

    const uset = await UserSettings.findOne({ user_id: user._id });
    console.log("uset", uset);

    var responseMessage;
    var status = 200;

    if (uset.two_factor) {
      status = 302;
      responseMessage = { message: `needs 2 factor auth`, id: user._id };
      const hash = crypto.randomUUID();
      const code = hash.slice(0, 6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const token = await TwoFactorCode.create({
        code,
        user_id: user._id,
        expiresAt,
        used: false,
      });
      const data = { code: 6, email: user.email, token: token.code };
      channel.sendToQueue(
        "orders",
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          })
        )
      );
    }

    if (uset.passwordless) {
      status = 303;
      responseMessage = { message: `needs passwordless`, id: user._id };
      const hash = crypto.randomUUID();
      const code = hash.slice(0, 6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const token = await PwdLessCode.create({
        code,
        user_id: user._id,
        expiresAt,
        used: false,
      });
      const data = { code: 5, email: user.email, token: token.code };
      channel.sendToQueue(
        "orders",
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          })
        )
      );
    }

    if (!uset.passwordless && !uset.two_factor) {
      const token = createToken(user._id);
      responseMessage = { user, token };
      status = 200;
          //add data to loginHistory
    }

    console.log(`resp`, responseMessage);
    res.status(status).json(responseMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//signin user
const PasswordLessLogin = async (req, res) => {
  const { code } = req.body;
  try {
    if (!code) {
      throw Error("please add code");
    }

    const user = await PwdLessCode.findOne({ code });
    const reccode = await RecCode.findOne({ code });

    const currentDate = new Date();
    if (!user || user.used || user.expiresAt <= currentDate) {
      if (reccode && !reccode.used) {
        console.log(`we ok`);
      } else {
        throw Error("incorrect code");
      }
    }

    var id;
    if (user) {
      id = user.user_id;
    }

    if (reccode) {
      id = reccode.user_id;
    }

    const user2 = await User.findById(id);

    const token = createToken(user2._id);
    if (user) {
      const update = await PwdLessCode.findByIdAndUpdate(user._id, {
        used: true,
      });
    }

    if (reccode) {
      const update2 = await RecCode.findByIdAndUpdate(reccode._id, {
        used: true,
        current: false,
      });
    }

    //add data to loginHistory

    res.status(200).json({ user: user2, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//signin user
const TwoFactor = async (req, res) => {
  const { code, id } = req.body;
  try {
    if (!code) {
      throw Error("please add code");
    }

    const user = await TwoFactorCode.findOne({ code });
    const reccode = await RecCode.findOne({ code });
    console.log(`reccode`, reccode);

    const currentDate = new Date();

    var mainID;

    if (
      !user ||
      user.user_id !== id ||
      user.used ||
      user.expiresAt <= currentDate
    ) {
      if (reccode && !reccode.used) {
        console.log(`we ok`);
      } else {
        throw Error("incorrect code");
      }
    }

    if (user) {
      mainID = user.user_id;
    }

    if (reccode) {
      mainID = reccode.user_id;
    }

    const user2 = await User.findById(id);

    const token = createToken(user2._id);

    if (user) {
      const update = await TwoFactorCode.findByIdAndUpdate(user._id, {
        used: true,
      });
    }

    if (reccode) {
      const update2 = await RecCode.findByIdAndUpdate(reccode._id, {
        used: true,
        current: false,
      });
    }

        //add data to loginHistory

    res.status(200).json({ user: user2, token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//signin user
const Send2factorEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw Error("please enter email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error("user does not exist");
    }

    const uset = await UserSettings.findOne({ user_id: user._id });

    if (uset.two_factor) {
      const hash = crypto.randomUUID();
      const code = hash.slice(0, 6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const token = await TwoFactorCode.create({
        code,
        user_id: user._id,
        expiresAt,
        used: false,
      });
      const data = { code: 6, email: user.email, token: token.code };
      channel.sendToQueue(
        "orders",
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          })
        )
      );
    }

    res.status(200).json({ message: `email sent` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//check email
const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw Error("please enter email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error("user does not exist");
    }

    const uset = await UserSettings.findOne({ user_id: user._id });

    var responseMessage;
    var status = 200;

    if (uset.passwordless) {
      status = 303;
      responseMessage = { message: `needs passwordless`, id: user._id };
      const hash = crypto.randomUUID();
      const code = hash.slice(0, 6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const token = await PwdLessCode.create({
        code,
        user_id: user._id,
        expiresAt,
        used: false,
      });
      const data = { code: 5, email: user.email, token: token.code };
      channel.sendToQueue(
        "orders",
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          })
        )
      );
    }

    if (!uset.passwordless) {
      const token = createToken(user._id);
      responseMessage = { email: user.email };
      status = 200;
    }

    res.status(status).json(responseMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  PasswordLessLogin,
  TwoFactor,
  Send2factorEmail,
  checkEmail,
};
