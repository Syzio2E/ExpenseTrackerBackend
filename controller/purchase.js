const Razorpay = require('razorpay');
const Order = require('../model/order');
const userController = require('./user');
require('dotenv').config()

const purchasepremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RZP_KEY_Id,
      key_secret: process.env.RZP_KEY_SECRET
    });

    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        req.user.createOrder({ orderid: order.id, status: 'FAILURE' }).then(() => {
          throw new Error(JSON.stringify(err));
        }).catch(err => {
          throw new Error(err);
        });
      }

      req.user.createOrder({ orderid: order.id, status: 'PENDING' })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch(err => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: 'Something went wrong', error: err });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id, order_id } = req.body;

    console.log('order>>>', order_id);
    const order = await Order.findOne({ where: { orderid: order_id } });
    console.log('order>>>', order);

    if (order) {
      if (payment_id) {
        const promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = req.user.update({ ispremiumuser: true });

        Promise.all([promise1, promise2])
          .then(() => {
            return res.status(202).json({ success: true, message: "Transaction Successful", token: userController.generateAccessToken(userId, undefined, true) });
          })
          .catch((error) => {
            throw new Error(error);
          });
      } else {
        const promise1 = order.update({ status: 'FAILED' });
        const promise2 = req.user.update({ ispremiumuser: false });

        await Promise.all([promise1, promise2]);

        return res.status(202).json({ success: true, message: "Transaction Failed", token: userController.generateAccessToken(userId, undefined, true) });
      }
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({ error: err, message: 'Something went wrong' });
  }
};

module.exports = {
  purchasepremium,
  updateTransactionStatus
};