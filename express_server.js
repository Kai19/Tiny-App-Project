var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  const length = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";

  for (let i = 0; i < length; i++) {
      str = str + chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", { shortURL:req.params.id,
                            longURL: urlDatabase[req.params.id],
                            username: req.cookies.username});
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if(longURL){
    res.redirect(longURL);
  }else{
    res.end("Not found");
  }
});

app.post("/urls", (req, res) => {
  if(req.body.longURL){
    const randString = generateRandomString();
    urlDatabase[randString] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect(`/urls/${randString}`);
  }else{
    res.end("Invalid input please try again!")
  }
});

app.post("/login", (req, res) =>{
  if(req.body.username){
    res.cookie("username", req.body.username);
    res.redirect("/urls");
  }else{
    res.end("Please input username :) ");
  };
})

app.post("/logout", (req, res) =>{
  res.clearCookie("username");
  res.redirect("/urls");
})


app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    console.log(urlDatabase);
    res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  if(req.body.longURL){
    urlDatabase[req.params.id] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect("/urls");
  }else{
    res.end("Please put a valid input! and have a nice day :)")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
