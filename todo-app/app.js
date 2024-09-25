//const { request, response } = require("express");
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  if (req.accepts("html")) {
    res.render("index", { allTodos });
  } else {
    res.json({ allTodos });
  }
});

app.get("/todos", async (req, res) => {
  console.log("Todo list");
  try {
    const tasks = await Todo.findAll();
    console.log(tasks.every((task) => task instanceof Todo)); // true
    console.log("All Tasks:", JSON.stringify(tasks, null, 2));
    return res.json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.post("/todos", async (req, res) => {
  console.log("Creating a todo", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.json(todo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("We have to update a todo with ID:", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.delete("/todos/:id", async (req, res) => {
  console.log("Delete a todo by ID:", req.params.id);
  try {
    const todo = await Todo.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (todo == 1) return res.send(true);
    return res.send(false);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

module.exports = app;
