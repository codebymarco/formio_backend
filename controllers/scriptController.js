const Form = require("../models/formModel");

//get single job
const getForm = async (req, res) => {
  const id = req.params.id;

  try {
    const form = await Form.findById(id);
    if (!form) {
      throw Error("no form");
    }
    if (!form.status) {
        throw Error("no form");
      }
    res.status(200).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getForm,
};
