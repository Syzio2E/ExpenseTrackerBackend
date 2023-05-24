const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const sequelize = require('./util/database')
const userRouter = require('./routes/user')
const expenseRouter = require('./routes/expense')
const User = require('./model/user')
const Expense = require('./model/expense')
const Order = require('./model/order')
const purchaseRouter = require('./routes/purchase')
const premiumFeaturesRouter = require('./routes/premiumfeatures')
const resetPasswordRoutes = require('./routes/forgotpassword')
const Forgotpassword = require('./model/forgotpassword');
require('dotenv').config()
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')

const accesLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags: 'a'})

const app = express()
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(morgan('combined',{stream:accesLogStream}))

app.use(express.json())
app.use(userRouter)
app.use(expenseRouter)
app.use(purchaseRouter)
app.use(premiumFeaturesRouter)
app.use(resetPasswordRoutes)


User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword)
Forgotpassword.belongsTo(User)


sequelize.sync().then(
    app.listen(process.env.PORT)
).catch(err=>{
    console.log(err)
})