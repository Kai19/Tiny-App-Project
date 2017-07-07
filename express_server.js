var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

// app.use(function(req, res, next){
//   res.locals ={
//     user_email: users[req.cookies.user_id] ? users[req.cookies.user_id].name : undefined
//   };
//   next();
// });

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: "123"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "qwe"
  },
  "kai": {
    id: "kai",
    email: "kai@kai.kai",
    password: "kai"
  }
};

function generateRandomString() {
  const length = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";

  for (let i = 0; i < length; i++) {
    str = str + chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

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

app.set("view engine", "ejs");

var urlDatabase = {
  User1: {"b2xVn2": "http://www.lighthouselabs.ca"},
  User2: {"9sm5xK": "http://www.google.com"},
  kai: {"Wah4h4": "http://www.muggle.com"}
};
  // "b2xVn2": {
  //             url:  "http://www.lighthouselabs.ca",
  //             user: User1
  //           },


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(users[req.cookies["user_id"]]){
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.render("urls_show", { user: users[req.cookies["user_id"]],
                            shortURL: shortURL,
                            longURL: urlDatabase[req.cookies["user_id"]][shortURL]
                            });
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = "";
  for(let user in urlDatabase){
    for(let shortURL in urlDatabase[user]){
      if(req.params.shortURL === shortURL){
        longURL = urlDatabase[user][shortURL];
        break;
      }
    }
  };
  longURL = httpCheck(longURL);
  console.log(longURL);
  if(longURL){
    res.redirect(longURL);
  }else{
    res.end("Not found");
  }
});

app.post("/urls", (req, res) => {
  // if(req.body.longURL){
    const randString = generateRandomString();
    const userID = req.cookies["user_id"];
    if(urlDatabase[userID] === undefined){
      urlDatabase[userID] = {};
      urlDatabase[userID][randString] = req.body.longURL;
    }else{
      urlDatabase[userID][randString] = req.body.longURL;
    }
    console.log(urlDatabase);
    res.redirect(`/urls/${randString}`);
  // }
});

app.post("/login", (req, res) =>{
  const userCheck = users[emailChecker(req.body.email)];
  if(req.body.email === userCheck.email && req.body.password === userCheck.password){
    res.cookie("user_id", emailChecker(req.body.email));
    res.redirect("/urls");
  }else{
    res.sendStatus("403");
  }
});

app.post("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) =>{
  if(req.body.email === "" || req.body.password === ""){
    res.sendStatus("400");
  }else if (users[emailChecker(req.body.email)]){
    res.sendStatus("400");
  }else{
    const randUser = generateRandomString();
    users[randUser] = {
      id: randUser,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randUser);
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.cookies["user_id"]][req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  if(req.body.longURL){
    if(urlDatabase[req.cookies.user_id][req.params.id]){
      urlDatabase[req.cookies.user_id][req.params.id] = req.body.longURL;
      console.log(urlDatabase);
      res.redirect("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
