const todoList = require("../todo");
const { all, markAsComplete, add, dueToday, dueLater, overdue } = todoList();
describe("Todolist Test Suite", () => {
  beforeAll(() => {
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
  });
  test("Should add new todo", () => {
    const todoListCount = all.length;
    add({
      title: "Test todo1",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    expect(all.length).toBe(todoListCount + 1);
  });
  test("Should mark a todo as completed", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
  test("Should retrieve overdue items", () => {
    add({
      title: "Test todo2",
      completed: false,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
        .toISOString()
        .slice(0, 10),
    });
    expect(overdue().length >= 1).toBe(true);
  });
  test("Should retrieve due today items", () => {
    expect(dueToday().length >= 1).toBe(true);
  });
  test("Should retrieve due later items", () => {
    add({
      title: "Test todo3",
      completed: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24)
        .toISOString()
        .slice(0, 10),
    });
    expect(dueLater().length >= 1).toBe(true);
  });
});
