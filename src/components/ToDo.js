import React, { useState, useEffect, useCallback } from "react";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { MdShare } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";




function ToDo() {
  const [task, setTask] = useState("");
  const [lists, setList] = useState([]);
  const [id, setId] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskValue, setEditedTaskValue] = useState("");
  const [editedDueDate, setEditedDueDate] = useState("");
  const [editedPriority, setEditedPriority] = useState("medium");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [filter, setFilter] = useState("all");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedId = JSON.parse(localStorage.getItem("id")) || 1;
    setList(savedTasks);
    setId(savedId);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(lists));
    localStorage.setItem("id", JSON.stringify(id));
  }, [lists, id]);

  const filteredTasks = lists.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;

    setList((prevList) => {
      const items = Array.from(prevList);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      return items;
    });
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const submitTask = (e) => {
    e.preventDefault();
    const trimmedTask = task.trim();
    if (trimmedTask !== "" && !lists.some((t) => t.value === trimmedTask)) {
      setList([
        ...lists,
        { id: id, value: trimmedTask, completed: false, dueDate: dueDate, priority: priority },
      ]);
      setTask("");
      setDueDate("");
      setPriority("medium");
      setId(id + 1);
      showNotification("Task added successfully!", "success");
    } else {
      showNotification("Task cannot be empty or a duplicate.", "error");
    }
  };

  const handleDelete = (id) => {
    setList(lists.filter((task) => task.id !== id));
    showNotification("Task deleted successfully!", "success");
  };

  const toggleCompletion = (id) => {
    setList(
      lists.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditedTaskValue(task.value);
    setEditedDueDate(task.dueDate || "");
    setEditedPriority(task.priority || "medium");
  };

  const saveEditedTask = (id) => {
    const trimmedValue = editedTaskValue.trim();

    if (trimmedValue === "") {
      showNotification("Task cannot be empty!", "error");
      return;
    }

    const isDuplicate = lists.some(
      (task) => task.id !== id && task.value === trimmedValue
    );

    if (isDuplicate) {
      showNotification("Task already exists!", "error");
      return;
    }

    setList(
      lists.map((task) =>
        task.id === id
          ? {
              ...task,
              value: trimmedValue,
              dueDate: editedDueDate,
              priority: editedPriority,
            }
          : task
      )
    );
    setEditingTaskId(null);
    showNotification("Task updated successfully!", "success");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskValue("");
    setEditedDueDate("");
    setEditedPriority("medium");
  };

  const shareTask = (taskId) => {
    const taskToShare = lists.find((task) => task.id === taskId);
    if (!taskToShare) return;

    const shareableLink = `${window.location.origin}/task/${taskId}?name=${encodeURIComponent(taskToShare.value)}&dueDate=${encodeURIComponent(taskToShare.dueDate || "")}&priority=${encodeURIComponent(taskToShare.priority)}`;

    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        showNotification(shareableLink, "success");
      })
      .catch(() => {
        showNotification("Failed to copy link. Please try again.", "error");
      });
  };

  return (
    <div className="main">
      <div className="Header">
        <h1>To-do List</h1>
      </div>

      <div className="body">
        <Notification message={notification.message} type={notification.type} />

        <div className="filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "incomplete" ? "active" : ""}
            onClick={() => setFilter("incomplete")}
          >
            Incomplete
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        <div className="list-body">
          <DragDropContext onDragEnd={onDragEnd}>
            {filteredTasks.length > 0 ? (
              <Droppable droppableId="tasks">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="task-list"
                  >
                    {filteredTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`list ${task.priority}`}
                          >
                            <div
                              className="drag-handle"
                              {...provided.dragHandleProps}
                            >
                              ☰
                            </div>
                            {editingTaskId === task.id ? (
                              <div className="edit-mode">
                                <input
                                  type="text"
                                  value={editedTaskValue}
                                  onChange={(e) => setEditedTaskValue(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && saveEditedTask(task.id)}
                                  autoFocus
                                />
                                <input
                                  type="date"
                                  value={editedDueDate}
                                  onChange={(e) => setEditedDueDate(e.target.value)}
                                />
                                <select
                                  value={editedPriority}
                                  onChange={(e) => setEditedPriority(e.target.value)}
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <div className="edit-actions">
                                  <button onClick={() => saveEditedTask(task.id)}>Save</button>
                                  <button onClick={cancelEditing}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="display-mode">
                                <button
                                  className="check-button"
                                  onClick={() => toggleCompletion(task.id)}
                                >
                                  {task.completed ? "✔️" : "◻️"}
                                </button>
                                <li
                                  style={{
                                    textDecoration: task.completed ? "line-through" : "none",
                                    color: task.completed ? "#888" : "#333",
                                  }}
                                >
                                  {task.value} {task.dueDate && `(Due: ${task.dueDate})`}
                                </li>
                                <button className="edit" onClick={() => startEditing(task)}>
                                <FaRegEdit />
                                </button>
                                <button className="del" onClick={() => handleDelete(task.id)}>
                                <IoMdRemoveCircleOutline />
                                </button>
                                <button className="share" onClick={() => shareTask(task.id)}>
                                <MdShare />                                
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            ) : (
              <p>No tasks to display.</p>
            )}
          </DragDropContext>
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
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="button">
              <button type="submit" className="btn">
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const Notification = ({ message, type }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message)
      .then(() => setIsCopied(true))
      .catch(() => setIsCopied(false));
  };

  if (!message) return null;

  const isLink = message.startsWith("http");

  return (
    <div className={`notification ${type}`}>
      {isLink ? (
        <div className="notification-link">
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
          <button onClick={handleCopy} className="copy-button">
            {isCopied ? "Copy" : "Copied!"}
          </button>
        </div>
      ) : (
        message
      )}
    </div>
  );
};

export default ToDo;
