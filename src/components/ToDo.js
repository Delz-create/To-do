import React, { useState, useEffect } from "react";

function ToDo() {
  const [task, setTask] = useState("");
  const [lists, setList] = useState([]);
  const [id, setId] = useState(1);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setList(savedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(lists));
  }, [lists]);

  const submitTask = (e) => {
    e.preventDefault();
    const trimmedTask = task.trim();
    if (trimmedTask !== "" && !lists.some((t) => t.value === trimmedTask)) {
      setList([...lists, { id: id, value: trimmedTask, completed: false }]);
      setTask("");
      setId(id + 1);
    } else {
      alert("Task cannot be empty or a duplicate.");
    }
  };

  const handleDelete = (id) => {
    setList(lists.filter((task) => task.id !== id));
  };

  const toggleCompletion = (id) => {
    setList(
      lists.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleClearAll = () => {
    setList([]);
  };

  return (
    <div className="main">
      <div className="Header">
        <h1>To-do List</h1>
      </div>

      <div className="body">
        <div className="list-body">
          <ul>
            {lists.map((task) => (
              <div className="list" key={task.id}>
                <li
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#888" : "#333",
                  }}
                  onClick={() => toggleCompletion(task.id)}
                >
                  {task.value}
                </li>
                <button className="del" onClick={() => handleDelete(task.id)}>
                  Remove
                </button>
              </div>
            ))}
          </ul>
        </div>

        <div className="task-counter">
          {lists.filter((task) => !task.completed).length} tasks remaining
        </div>

        <div className="form">
          <form onSubmit={submitTask}>
            <div className="input">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Add a new task"
              />
            </div>

            <div className="button">
              <button type="submit" className="btn">
                Add
              </button>
            </div>
          </form>
        </div>

        <button className="clear-all" onClick={handleClearAll}>
          Clear All
        </button>
      </div>
    </div>
  );
}

export default ToDo;