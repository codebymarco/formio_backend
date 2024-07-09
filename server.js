const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scriptRoutes = require("./routes/scriptRoutes");
const formRoutes = require("./routes/formRoutes");
const messageRoutes = require("./routes/messageRoutes");
const pwdRoutes = require("./routes/pwdRoutes");
const securityRoutes = require("./routes/securityRoutes");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/forms", formRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/pwd", pwdRoutes);
app.use("/api/security", securityRoutes);

app.use("/api/scripts/", scriptRoutes);

app.get("/", (req, res) => {
  res.send("contact me running");
});

//"mongodb+srv://marcomongo:mongomarco@marcosclusterno1.kzoqh.mongodb.net/showcase?retryWrites=true&w=majority"
//mongodb+srv://marcoramcharandev:Kfzx5CSe1rifx6Nm@projects.qaiwadq.mongodb.net/contactmedev?retryWrites=true&w=majority

mongoose
  .connect(
    "mongodb+srv://miguelmarcoramcharan:miguelmarcoramcharan@marcoramcharan.ji59fop.mongodb.net/sayhi?retryWrites=true&w=majority&appName=MARCORAMCHARAN"
  )
  .then(() => {
    console.log("connected to the database");
  })
  .catch((error) => {
    console.log(error);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server running");
});
