var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// var cookieParser = require('cookie-parser');
// app.use(cookieParser());

const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],


  maxAge: 24 * 60 * 60 * 1000
}));

// app.use(function(req, res, next){
//   res.locals ={
//     user_email: users[req.session.user_id] ? users[req.session.user_id].name : undefined
//   };
//   next();
// });


const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: bcrypt.hashSync("qwe", 10)
  },
  "kai": {
    id: "kai",
    email: "kai@kai.kai",
    password: bcrypt.hashSync("kai", 10)
  }
};

var urlDatabase = {
  User1: {"b2xVn2": "http://www.lighthouselabs.ca"},
  User2: {"9sm5xK": "http://www.google.com"},
  kai: {"Wah4h4": "https://www.reddit.com/r/noveltranslations/"}
};
// "b2xVn2": {
//             url:  "http://www.lighthouselabs.ca",
//             user: User1
//           },

function generateRandomString() {
  const length = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";

  for (let i = 0; i < length; i++) {
    str = str + chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

// emailChecker checks if email in user database and returns the user's ID
function emailChecker(email){
  // return !!Object.values(users).find(user=>user.email===email)
  for(let uid in users){
    if(users[uid].email === email){
      return uid;
    }
  }
  return false;
}

function httpCheck(longURL){
  if(longURL.includes('https') || longURL.includes('http')){
    return longURL;
  }else{
    const newLongUrl = "http://" + longURL;
    return newLongUrl;
  }
}

// the for loop checks iterates through the urlDatabase and checks if shortURL exists
function shortURLcheck(link){
  for(let user in urlDatabase){
    for(let shortURL in urlDatabase[user]){
      if(link === shortURL){
        return urlDatabase[user][shortURL];
      }
    }
  }
}

app.set("view engine", "ejs");



app.get("/", (req, res) => {
  if(req.session.user_id !== null){
    res.redirect("/urls");
  }else{
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  if(req.session.user_id == null){
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  }else{
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  if(req.session.user_id == null){
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }else{
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(users[req.session.user_id]){
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if(req.session.user_id !== null){
    if(urlDatabase[req.session.user_id][req.params.id] === undefined){
      res.send("Sorry this either shortURL belongs to someone else or doesn't exist!");
    }else{
      const shortURL = req.params.id;
      let templateVars = {
        user: users[req.session.user_id],
        shortURL: shortURL,
        longURL: urlDatabase[req.session.user_id][shortURL]
      };
      res.render("urls_show", templateVars);
    }
  }else{
    res.send("Sorry you are not logged in!");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = "";
  if(shortURLcheck(req.params.shortURL)){
    longURL = shortURLcheck(req.params.shortURL);
  }else{
    res.send("Sorry shortURL does not exist!");
  }

  longURL = httpCheck(longURL);
  console.log(longURL);
  if(longURL){
    res.redirect(longURL);
  }else{
    res.end("Not found");
  }
});

app.post("/urls", (req, res) => {
  if(req.body.longURL){
    // randString will be the user's 6 digit random id
    const randString = generateRandomString();
    const userID = req.session.user_id;
    if(urlDatabase[userID] === undefined){
      urlDatabase[userID] = {};
      urlDatabase[userID][randString] = req.body.longURL;
    }else{
      urlDatabase[userID][randString] = req.body.longURL;
    }
    console.log(urlDatabase);
    res.redirect(`/urls/${randString}`);
  }
});

app.post("/login", (req, res) =>{
  // emailChecker returns the user's ID
  // userCheck will represent the current user's object in users database
  console.log(req.body.email);
  if(users[emailChecker(req.body.email)] === undefined){
    res.send("Not a vaild email or password. Please try again!");
  }else{
    const userCheck = users[emailChecker(req.body.email)];
    if(req.body.email === userCheck.email && bcrypt.compareSync(req.body.password, userCheck.password)){
      req.session.user_id = emailChecker(req.body.email);
      res.redirect("/urls");
    }else{
      res.status("403").send("Sorry either email or password is incorrect");
    }
    console.log(users);
  }
});

app.post("/logout", (req, res) =>{
  req.session.user_id = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) =>{
  if(req.body.email === "" || req.body.password === ""){
    res.status("400").send("Not a vaild email or password. Please try again!");
  }else if (users[emailChecker(req.body.email)]){
    res.send("400").send("Sorry email is already registered");
  }else{
    const randUser = generateRandomString();
    const hashed_pass = bcrypt.hashSync(req.body.password, 10);
    users[randUser] = {
      id: randUser,
      email: req.body.email,
      password: hashed_pass
    };
    req.session.user_id = randUser;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.session.user_id][req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  if(req.body.longURL){
    if(urlDatabase[req.session.user_id][req.params.id]){
      urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
      console.log(urlDatabase);
      res.redirect("/urls");
    }else{
      res.send("Please don't update! This link belongs to someone else!");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
