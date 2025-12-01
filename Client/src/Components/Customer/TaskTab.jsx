import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Policy renewal discussion", meta: "Due: Tomorrow • High Priority", completed: false },
    { id: 2, text: "Submit health documents", meta: "Completed: 2 days ago", completed: true },
    { id: 3, text: "Discuss new investment options", meta: "Due: Next week • Medium Priority", completed: false }
  ]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error("Task cannot be empty!");
      return;
    }
    setTasks([...tasks, { id: Date.now(), text: newTask, meta: "Due: No due date set", completed: false }]);
    setNewTask("");
    toast.success("Task added successfully!");
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success("Task deleted successfully!");
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, meta: !task.completed ? "Completed: Today" : "Due: No due date set" }
        : task
    ));
  };

  return (
    <div className="tab-content">
      <h3>Tasks & Follow-ups</h3>
      <div className="task-list">
        {tasks.map(task => (
          <div className="task-item" key={task.id}>
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
              />
            </div>
            <div className="task-content">
              <label className={task.completed ? "completed" : ""}>
                {task.text}
              </label>
              <p className="task-meta">{task.meta}</p>
            </div>
            <div className="task-actions">
              <button className="btn-icon" onClick={() => handleDeleteTask(task.id)}>
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <div className="add-task">
          <input
            type="text"
            placeholder="Add new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <button className="btn-primary" onClick={handleAddTask}>Add</button>
        </div>
      </div>
    </div>
  );
}





export default TasksTab
