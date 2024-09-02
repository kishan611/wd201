const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    // Write the date check condition here and return the array
    // of overdue items accordingly.
    return all.filter((item)=> item.dueDate<new Date().toISOString().slice(0,10));
    // let overdueItems = [];
    // all.forEach(function (task) {
    //   if (task.dueDate==yesterday) {
    //     overdueItems.push(task);
    //   }
    // });
    // return overdueItems;
  };

  const dueToday = () => {
    // Write the date check condition here and return the array
    // of todo items that are due today accordingly.
    return all.filter((item)=> item.dueDate==new Date().toISOString().slice(0,10));
    // let dueTodayItems = [];
    // all.forEach(function (task) {
    //   if (task.dueDate == today) {
    //     dueTodayItems.push(task);
    //   }
    // });
    // return dueTodayItems;
  };

  const dueLater = () => {
    // Write the date check condition here and return the array
    // of todo items that are due later accordingly.
    return all.filter((item)=> item.dueDate>new Date().toISOString().slice(0,10));
    // let dueLaterItems = [];
    // all.forEach(function (task) {
    //   if (task.dueDate == tomorrow) {
    //     dueLaterItems.push(task);
    //   }
    // });
    // return dueLaterItems;
  };

  const toDisplayableList = (list) => {
    // Format the To-Do list here, and return the output string
    // as per the format given above.
    return list.map((task)=>`${task.completed?'[x]':'[ ]'} ${task.title} ${task.dueDate==new Date().toISOString().slice(0,10)?" ":task.dueDate}`)
    // let res = "";
    // list.forEach((item) => {
    //   if (item.completed) {
    //     res += "[x] ";
    //   } else {
    //     res += "[ ] ";
    //   }
    //   res += `${item.title} `;
    //   if (item.dueDate !== today) {
    //     res += `${item.dueDate}\n`;
    //   } else {
    //     res += "\n";
    //   }
    // });
    // return res;
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

module.exports = todoList;