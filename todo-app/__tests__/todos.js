const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password,
    _csrf: csrfToken,
  });
};
describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });
  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });
  test("create a new todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Updating a todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markAsCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markAsCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
    const markAsCompleteResponse2 = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
    const parsedUpdateResponse2 = JSON.parse(markAsCompleteResponse2.text);
    expect(parsedUpdateResponse2.completed).toBe(false);
  });
  // test("Fetches all todos in the database using /todos endpoint", async () => {
  //   const agent = request.agent(server);
  //   await login(agent, "user.a@test.com", "12345678");
  //   let res = await agent.get("/todos");
  //   let csrfToken = extractCsrfToken(res);
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   const groupedTodosResponse = await agent
  //     .get("/todos")
  //     .set("Accept", "application/json");
  //   const parsedResponse = JSON.parse(groupedTodosResponse.text);
  //   // const response = await agent.get("/todos");
  //   // const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });
  test("Delete a todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedResponse.dueToday.length;
    const latestTodo = parsedResponse.dueToday[dueTodayCount - 1];
    const todoId = latestTodo.id;

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const deleteTodo = await agent.delete(`/todos/${todoId}/`).send({
      _csrf: csrfToken,
    });
    const deleteTodoResponseBody = JSON.parse(deleteTodo.text);
    expect(deleteTodoResponseBody.success).toBe(true);
  });
});
