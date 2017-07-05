var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

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

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});