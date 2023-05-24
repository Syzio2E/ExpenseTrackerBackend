const Expense = require('../model/expense')
const User = require('../model/user')
const sequelize = require('../util/database')
const { Op } = require('sequelize');

const addExpense = async (req, res, next) => {
  const t = await sequelize.transaction()
  const { money, description, category, userId } = req.body;
  if (money === undefined || money.length === 0) {
    return res.status(400).json({ success: false, message: 'Parameters missing' });
  }
  try {
    const expense = await Expense.create({
      money,
      description,
      category,
      userId: req.user.id,
    },{transaction:t});
    const user = await User.findOne({ where: { id: req.user.id },transaction:t });
    if (user) {
      user.totalExpense += parseFloat(expense.money);
      await user.save({transaction:t});
    }
    t.commit()
    res.status(200).json({ message: 'Successfully added' });
  } catch (err) {
    t.rollback()
    console.log(err);
    res.status(400).json({ message: 'Failure' });
  }
};

const deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseid;
  if (!expenseId || isNaN(expenseId)) {
    return res.status(400).json({ success: false, message: 'Invalid expense ID' });
  }
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne({ where: { id: expenseId, userId: req.user.id }, transaction: t });
    if (!expense) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Expense doesn't belong to the user" });
    }
    const user = await User.findOne({ where: { id: req.user.id }, transaction: t });
    if (user) {
      user.totalExpense -= parseFloat(expense.money);
      await user.save({ transaction: t });
    }

    await expense.destroy({ transaction: t });
    await t.commit();
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};



const getExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    let totalExpense = 0;
    expenses.forEach((expense) => {
      totalExpense += parseFloat(expense.money);
    });
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      user.totalExpense = totalExpense;
      await user.save();
    }

    res.status(200).json(expenses);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'No expense data' });
  }
};

const getUserExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ 
      where: { userId: req.user.id },
      attributes: ['createdAt', 'money', 'description', 'category']
    });

    let totalExpense = 0;
    expenses.forEach((expense) => {
      totalExpense += parseFloat(expense.money);
    });

    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      user.totalExpense = totalExpense;
      await user.save();
    }

    res.status(200).json({ expenses, totalExpense });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'No expense data' });
  }
};

module.exports = {
    addExpense,
    getExpense,
    deleteExpense,
    getUserExpense
}