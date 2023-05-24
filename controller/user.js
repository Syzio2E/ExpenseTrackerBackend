const User = require('../model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

 function generateAccessToken(id){
return jwt.sign({userId:id},process.env.SECRET_KEY)
}

const signup = async (req,res,next)=>{
    const {name,email,password} = req.body
    if(name==null || email==null || password==null ){
        return res.status(400).json({message:'Bad Parameter'})
    }
    try{
        const existingUser = await User.findOne({where: {email:email}})
        if(existingUser){
            return res.status(409).json({message: 'email already exists'})
        } else {
            bcrypt.hash(password,10,async (err,hash)=>{
                const newUser = await User.create({
                    name,
                    email,
                    password:hash,
                    ispremiumuser:false
                })
                res.status(200).json({message:'User created Successfully',token:generateAccessToken(newUser.id)})
            })
        }
    }catch(err){
        res.status(500).json({err: 'Something went wrong'})
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (email == null || password == null) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({ message: 'No user found' });
      }
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            res.status(200).json({ message: 'Login successful',token:generateAccessToken(user.id) });
          } else {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
          }
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  };
  
  const checkPremiumStatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const premium = user.ispremiumuser;
      res.status(200).json({ premium });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = {
    signup,
    login,
    generateAccessToken,
    checkPremiumStatus
}