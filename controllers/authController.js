const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const genPassword = require("../public/javascripts/passwordUtils").genPassword;
const validatePassword = require("../public/javascripts/passwordUtils").validatePassword;
passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user =  await User.findOne({userName: username}).collation({ locale: "en", strength: 2 }).exec();
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        };
        const isValid = validatePassword(password, user.hash ,user.salt);
        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false, { message: "Incorrect password" });
        }
        
      } catch(err) {
        return done(err);
      };
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await User.findById(_id).collation({ locale: "en", strength: 2 }).exec();
  
      done(null, user);
    } catch(err) {
      done(err);
    };
  });

exports.signUp = asyncHandler( async(req, res, next)=>{

    const editorReq = (req.body.data.editorReq == "on") ? true : false;
    const {salt, hash} = genPassword(req.body.data.password);
    const userNew = new User({
        userName: req.body.data.username,
        userEmail: req.body.data.email,
        salt: salt,
        hash: hash,
        dateCreated: req.body.data.dateCreated
    });
        try {
            const userNameExists = await User.findOne({userName: req.body.data.username}).collation({ locale: "en", strength: 2 }).exec();
            const userEmailExists = await User.findOne({userEmail: req.body.data.email}).collation({ locale: "en", strength: 2 }).exec();
            if(userNameExists){
                throw new Error("Username Already Exists!");
            } 
            if(userEmailExists){
                throw new Error("Email Alreaady exists");
            }
        } catch(err) {
            return res.status(404).end( err.message);
        }
        try{
            await userNew.save();
        } catch(err){
        }
        return res.status(200).end( "ok");
})

 exports.LogIn = asyncHandler(async (req, res, next) => {
    passport.authenticate("local", function (error, user, info) {
        if(error){
            return next(error);
        } if(!user) {
            return res.status(401).end('Wrong username or passowrd');
        }
        res.status(200).send({message: "User authenticated" , username: user.userName});
    })(req, res, next);
 });