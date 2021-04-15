import mongoose, {Error} from "mongoose";
import express, {Request, Response} from "express";
import cors from "cors";
import passport from "passport";
import passportLocal from "passport-local";
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import User from "./User";
import {UserInterface, DatabaseUserInterface} from "./Interfaces/UserInterface"
import dotenv from "dotenv";

const LocalStrategy = passportLocal.Strategy

mongoose.connect("mongodb+srv://root:root@blue.nk4ob.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true
}, (err : Error) => {
    if (err) throw err;
    console.log("congrats, youre connected")
});

// middleware & settings

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', credentials: true
}))
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// passport
passport.use(new LocalStrategy((username: string, password: string, done) => {
  User.findOne({ username: username }, (err, user: DatabaseUserInterface) => {
    if (err) throw err;
    if (!user) return done(null, false);
    bcrypt.compare(password, user.password, (err, result: boolean) => {
      if (err) throw err;
      if (result === true) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  });
})
);



// route
app.post('/register', async (req : Request, res: Response) => {

 const { username, password } = req?.body;
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    res.send("Improper Values");
    return;
  }

//   if user already exist
  User.findOne({ username }, async (err, doc : UserInterface) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("success")
    }
  })
});

app.post('/login',
  passport.authenticate('local'),
  (req, res) => {
   res.send("successfully authenticated")
    // res.redirect('/users/' + req.user.username);
  });

  app.get("/user", (req, res) => {
      res.send(req.user)
  })

app.listen(3002, () => {
    console.log("server running on localhost 3002")
})
