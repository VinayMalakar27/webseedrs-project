import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === "member") {
      filter = { assignedTo: userId };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("projectId", "title")
      .limit(10);

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, assignedTo } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!title) return res.status(400).json({ message: "Title is required" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = new Task({
      title,
      projectId,
      assignedTo: assignedTo || null,
      status: "todo",
    });

    await task.save();
    await task.populate("assignedTo", "name email");

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status, title, assignedTo } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.members.some((m) => m.toString() === userId.toString());
    const isCreator = project.createdBy.toString() === userId.toString();
    const isAssigned = task.assignedTo?.toString() === userId.toString();

    if (userRole === "admin" && !isCreator) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (userRole === "admin") {
      // Admin can update title, status, and assignee
      if (title) task.title = title;
      if (status) task.status = status;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else if (isAssigned) {
      // Member can only update status if assigned
      if (status) task.status = status;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.save();
    await task.populate("assignedTo", "name email");

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
