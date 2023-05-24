const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../model/user');
const Forgotpassword = require('../model/forgotpassword');

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const id = uuid.v4();
      await user.createForgotpassword({ id, active: true });

      sgMail.setApiKey(process.env.SENGRID_API_KEY);

      const msg = {
        to: email,
        from: 'shubhamsaurabhk@gmail.com',
        subject: 'Reset Your Password',
        text: 'Follow the link to reset your password',
        html: `<a href="http://localhost:3000/resetpassword/${id}">Reset password</a>`,
      };

      await sgMail.send(msg);

      return res.json({
        message: 'Link to reset password sent to your email',
        success: true,
      });
    } else {
      throw new Error('User does not exist');
    }
  } catch (err) {
    console.error(err);
    return res.json({ message: err.message, success: false });
  }
};

const resetpassword = (req, res) => {
  const id = req.params.id;
  Forgotpassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
    if (forgotpasswordrequest) {
      forgotpasswordrequest.update({ active: false });
      res.status(200).send(`
        <html>
          <form action="/updatepassword/${id}" method="post">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required />
            <button>Reset Password</button>
          </form>
        </html>
      `);
    }
  });
};

const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.body;
    const { resetpasswordid } = req.params;
    const resetpasswordrequest = await Forgotpassword.findOne({
      where: { id: resetpasswordid },
    });
    if (resetpasswordrequest) {
      const user = await User.findOne({
        where: { id: resetpasswordrequest.userId },
      });
      if (user) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newpassword, salt);
        await user.update({ password: hash });
        return res.json({ message: 'Successfully updated the new password' });
      } else {
        return res.status(404).json({ error: 'No user exists', success: false });
      }
    }
  } catch (error) {
    return res.status(403).json({ error: error.message, success: false });
  }
};

module.exports = {
  forgotpassword,
  updatepassword,
  resetpassword,
};