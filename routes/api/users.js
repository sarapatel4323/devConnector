const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input validation 
const validationRegisterInput = require('../../validation/register');
const validationLoginInput = require('../../validation/login');

//Local User model
const User = require('../../models/User'); 

//@route GET api/users/test
// @desc test users route 
//@route public route 
router.get('/test' , (req ,res) => res.json({ msg: 'Users Works' }));


//@route GET api/users/registration 
// @desc Register user  
//@route public router
router.post('/register' , (req ,res) => {
  const { errors , isValid } = validationRegisterInput(req.body);

  //Check Validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }) 
  .then(user => {
    if(user){
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }
    else {
      const avatar = gravatar.url(req.body.email ,{
        s: '200', //Size
        r :'pg', //Rating
        d:'mm' //Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10 , (err , salt) => {
        bcrypt.hash(newUser.password , salt , (err , hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
        })
      });
    }
  })
});


//@route GET api/users/login 
// @desc Login user / Return JWT token  
//@route public router
router.post('/login' , (req , res) => {
  
  const { errors , isValid } = validationLoginInput(req.body);
  
  //Check Validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email })
  .then(user => {
    //Check for user
    if(!user){
      errors.email = 'User not Found';
      return res.status(404).json(errors);
    }

    //Check Password
    bcrypt.compare(password , user.password)
    .then(isMatch => {
      if(isMatch) {
        // User matched

        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        } // Create jwt payload

        //Sign token
        jwt.sign(
          payload , 
          keys.secretOrKey , 
          { expiresIn: 3600 } , 
          (err , token) => {
            res.json({ 
              success: true,
              token : 'Bearer '+ token
            });
        });
      }
      else {
        errors.password = 'Password Incorrect';
        return res.status(404).json(errors); 
      }
    })
  })
});


//@route GET api/users/current
// @desc Return current user 
//@route private
router.get('/current' , passport.authenticate('jwt' , { session: false }) , (req ,res) => {
  res.json({
    id : req.user.id,
    name: req.user.name,  
    email: req.user.email
  });
}); 


module.exports = router;
