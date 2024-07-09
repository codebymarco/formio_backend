const User = require('../models/userModel')
const Token = require('../models/resetPasswordToken')
const UserSettings = require('../models/userSettings')
const PwdLessCode = require('../models/passwordlessSignupCode')


const bcrypt = require('bcrypt')
const crypto = require('crypto');

//rabbitmq connection
const amqplib = require('amqplib') 
let channel,connection

connect()

// connect to rabbitmq
async function connect() {
  try {
      // rabbitmq default port is 5672
    const amqpServer = 'amqps://wypzmmcz:f_wd5674l1TZBKA_F7DV7R4NxqnWVC68@moose.rmq.cloudamqp.com/wypzmmcz'
    connection = await amqplib.connect(amqpServer)
    channel = await connection.createChannel()

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue('orders')
  } catch (error) {
    console.log(error)
  }
}

const sendMessage = async (req, res) => {
    const email = req.params.email;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(200).json("email sent to reset password");
        return
      }  

      const hash = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const token = await Token.create({ token:hash, user_id:user._id, expiresAt});
      const data = {code:3,email:user.email,token:token.token}
      channel.sendToQueue(
        'orders',
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          }),
        ),
      )
      res.status(200).json("email sent to reset password");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const resetPassword = async (req, res) => {
  const { newPassword,token } = req.body;
  console.log(newPassword, token)
    try {
      const tok = await Token.findOne({ token });
      if (!tok) {
        throw Error("token does not exist");
      }
      const currentDate = new Date();

      if (tok.expiresAt <= currentDate ) {
        throw Error("token not valid please generate a new one");
      }
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(newPassword, salt)
      const newpassword = await User.findByIdAndUpdate(tok.user_id, { password: hash })
      console.log(newpassword)
      res.status(200).json("password ok");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const sendEmailLogin = async (req, res) => {
    const email = req.params.email;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(200).json("email sent with login code");
        return
      }  
      const usersettings = await UserSettings.findOne({ user_id:user._id });
      if (!usersettings.passwordless) {
        res.status(200).json("email sent with login code");
        return
      }  

      const hash = crypto.randomUUID();
      const code = hash.slice(0,6)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const token = await PwdLessCode.create({ code,user_id:user._id, expiresAt, used:false});
      const data = {code:5,email:user.email,token:token.code}
      channel.sendToQueue(
        'orders',
        Buffer.from(
          JSON.stringify({
            ...data,
            date: new Date(),
          }),
        ),
      )
      res.status(200).json("email sent with password login code");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


module.exports = {
    sendMessage,
    resetPassword,
    sendEmailLogin
}