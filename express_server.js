var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {urls: urlDatabase});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", { shortURL:req.params.id,
                            longURL: urlDatabase[req.params.id]});
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
  const randString = generateRandomString();

  urlDatabase[randString] = req.body.longURL;
  console.log(urlDatabase);
  console.log(req.body);
  res.redirect(`/urls/${randString}`);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    console.log(urlDatabase);
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
