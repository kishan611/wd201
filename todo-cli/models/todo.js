// models/todo.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      let todos = await Todo.overdue();
      let todoList = todos.map((todo) => todo.displayableString()).join("\n");
      console.log(todoList);
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      todos = await Todo.dueToday();
      todoList = todos.map((todo) => todo.displayableString()).join("\n");
      console.log(todoList);
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      todos = await Todo.dueLater();
      todoList = todos.map((todo) => todo.displayableString()).join("\n");
      console.log(todoList);
    }
    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      try {
        const todos = await Todo.findAll();
        return todos.filter(
          (item) => item.dueDate < new Date().toISOString().slice(0, 10)
        );
      } catch (error) {
        console.error(error);
      }
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      try {
        const todos = await Todo.findAll();
        return todos.filter(
          (item) => item.dueDate == new Date().toISOString().slice(0, 10)
        );
      } catch (error) {
        console.log(error);
      }
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      try {
        const todos = await Todo.findAll();
        return todos.filter(
          (item) => item.dueDate > new Date().toISOString().slice(0, 10)
        );
      } catch (error) {
        console.error(error);
      }
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      try {
        await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          }
        );
      } catch (error) {
        console.error(error);
      }
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title}${this.dueDate == new Date().toISOString().slice(0, 10) ? "" : " " + this.dueDate}`;
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
