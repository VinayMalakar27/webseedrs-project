import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { search } = req.query;

    let filter = {};
    if (userRole === "member") {
      filter = { members: userId };
    } else if (userRole === "admin") {
      filter = { createdBy: userId };
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const project = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if user has access
    const isMember = project.members.some((m) => m._id.toString() === userId.toString());
    const isCreator = project.createdBy._id.toString() === userId.toString();

    if (userRole === "member" && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (userRole === "admin" && !isCreator) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch and populate tasks
    const tasks = await Task.find({ projectId: id }).populate("assignedTo", "name email");
    project.tasks = tasks;

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!title) return res.status(400).json({ message: "Title is required" });

    const project = new Project({
      title,
      description,
      createdBy: userId,
      members: [],
    });

    await project.save();
    await project.populate("createdBy", "name email");

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    await project.save();
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Delete all tasks in project
    await Task.deleteMany({ projectId: id });

    res.json({ message: "Project deleted", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.members.includes(memberId)) {
      return res.status(400).json({ message: "Member already in project" });
    }

    project.members.push(memberId);
    await project.save();
    await project.populate("members", "name email");

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.members = project.members.filter((m) => m.toString() !== memberId);
    await project.save();
    await project.populate("members", "name email");

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
