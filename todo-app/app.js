//const { request, response } = require("express");
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");

const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["put", "delete", "post"]));

app.use(
  session({
    secret: "my-super-secret-key-12345678987654321",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, {
              message: "No user with that email found",
            });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

const path = require("path");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    // If logged in, redirect to /todos
    return res.redirect("/todos");
  }
  res.render("index", {
    title: "Todo Application",
    csrfToken: req.csrfToken(),
  });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  //const allTodos = await Todo.getTodos();
  const loggedInUser = req.user.id;
  const overDue = await Todo.overDue(loggedInUser);
  const dueToday = await Todo.dueToday(loggedInUser);
  const dueLater = await Todo.dueLater(loggedInUser);
  const completedTodos = await Todo.completedTodos(loggedInUser);
  if (req.accepts("html")) {
    res.render("todos", {
      title: "Todo Application",
      overDue,
      dueToday,
      dueLater,
      completedTodos,
      csrfToken: req.csrfToken(),
    });
    //res.render("index", { allTodos });
  } else {
    res.json({
      overDue,
      dueToday,
      dueLater,
      completedTodos,
    });
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup",
    csrfToken: req.csrfToken(),
  });
});

// app.get("/todos",connectEnsureLogin.ensureLoggedIn(),  async (req, res) => {
//   console.log("Todo list");
//   const loggedInUser = req.user.id;
//   try {
//     const tasks = await Todo.findAll();
//     console.log(tasks.every((task) => task instanceof Todo)); // true
//     console.log("All Tasks:", JSON.stringify(tasks, null, 2));
//     return res.json(tasks);
//   } catch (error) {
//     console.log(error);
//     return res.status(422).json(error);
//   }
// });

app.post("/users", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      // Return error if email is already registered
      console.log("Email already in use");
      return res.status(400).send("Email already in use");
    }
    const hashPwd = await bcrypt.hash(req.body.password, saltRounds);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPwd,
    });
    req.logIn(user, (err) => {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      }
      res.redirect("/todos");
    });
  } catch (err) {
    console.log(err);
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.user);
    res.redirect("/todos");
  }
);

app.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("Creating a todo", req.body);
  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
      userId: req.user.id,
    });
    return res.redirect("/todos");
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.put(
  "/todos/:id/",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("We have to update a todo with ID:", req.params.id);
    const { completed } = req.body;
    const todo = await Todo.findByPk(req.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(completed);
      return res.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("Delete a todo by ID:", req.params.id);
    try {
      await Todo.remove(req.params.id, req.user.id);
      return res.json({ success: true });
      // const todo = await Todo.destroy({
      //   where: {
      //     id: req.params.id,
      //   },
      // });
      // if (todo == 1) return res.send(true);
      // return res.send(false);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

module.exports = app;
