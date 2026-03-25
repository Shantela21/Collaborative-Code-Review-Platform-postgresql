// controllers/projectController.ts
import { Request, Response } from "express";
import {
  createProjectDB,
  getAllProjectsDB,
  getProjectByIdDB,
  updateProjectDB,
  deleteProjectDB,
  addProjectMemberDB,
  removeProjectMemberDB,
  getProjectMembersDB,
  getProjectMemberDB,
} from "../service/projectService";
import { ProjectWithMembers } from "../types";

// Helper to assert values exist
function assertExists<T>(value: T | undefined | null, message: string): T {
  if (value === undefined || value === null) throw new Error(message);
  return value;
}

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = assertExists(req.user?.id, "Authentication required");

    const project = await createProjectDB({
      title,
      description,
      created_by: userId,
    });

    const createdProject = assertExists(project, "Project creation failed");
    const projectId = assertExists(createdProject.id, "Project ID missing");

    // Add creator as admin
    await addProjectMemberDB(projectId, userId, "admin");

    // Build ProjectWithMembers
    const projectWithMembers: ProjectWithMembers = {
      id: projectId,
      title: createdProject.title,
      description: createdProject.description,
      created_by: createdProject.created_by,
      created_at: createdProject.created_at || new Date(),
      updated_at: createdProject.updated_at || new Date(),
      members: [
        {
          id: userId,
          name: (req.user as any)?.name || "",
          email: req.user?.email || "",
          role: "admin",
          member_since: new Date(),
        },
      ],
    };

    res.status(201).json(projectWithMembers);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};

// Get all projects for the current user
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = assertExists(req.user?.id, "Authentication required");
    const projects = await getAllProjectsDB(userId);
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = assertExists(req.user?.id, "Authentication required");

    const projectRaw = await getProjectByIdDB(projectId, userId);
    const project = assertExists(projectRaw, "Project not found");

    const membersRaw = await getProjectMembersDB(projectId);
    const members = membersRaw.map((m) => ({
      id: assertExists(m.id, "Member ID missing"),
      name: m.name,
      email: m.email,
      role: m.role,
      member_since: m.member_since,
    }));

    const projectWithMembers: ProjectWithMembers = {
      id: assertExists(project.id, "Project ID missing"),
      title: project.title,
      description: project.description,
      created_by: project.created_by,
      created_at: project.created_at || new Date(),
      updated_at: project.updated_at || new Date(),
      members,
    };

    res.json(projectWithMembers);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title, description } = req.body;
    const userId = assertExists(req.user?.id, "Authentication required");

    const member = await getProjectMemberDB(projectId, userId);
    if (!member || member.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    const updatedProject = await updateProjectDB(projectId, {
      title,
      description,
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = assertExists(req.user?.id, "Authentication required");

    const member = await getProjectMemberDB(projectId, userId);
    if (!member || member.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    await deleteProjectDB(projectId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};

// Add member to project
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const { userId, role = "member" } = req.body;
    const currentUserId = assertExists(req.user?.id, "Authentication required");

    const currentUserMember = await getProjectMemberDB(
      projectId,
      currentUserId,
    );
    if (!currentUserMember || currentUserMember.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to add members" });
    }

    const member = await addProjectMemberDB(projectId, userId, role);
    res.status(201).json(member);
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Error adding member to project" });
  }
};

// Remove member from project
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userIdToRemove = parseInt(req.params.userId);
    const currentUserId = assertExists(req.user?.id, "Authentication required");

    const currentUserMember = await getProjectMemberDB(
      projectId,
      currentUserId,
    );
    if (!currentUserMember || currentUserMember.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to remove members" });
    }

    // Prevent removing yourself if you are the only admin
    if (userIdToRemove === currentUserId) {
      const members = await getProjectMembersDB(projectId);
      const adminMembers = members.filter((m) => m.role === "admin");
      if (adminMembers.length <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot remove the only admin" });
      }
    }

    await removeProjectMemberDB(projectId, userIdToRemove);
    res.status(204).send();
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Error removing member from project" });
  }
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
