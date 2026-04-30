/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/api";
import TaskModal from "../components/TaskModal";

const statuses = [
  "To-Do",
  "In-Progress",
  "Testing",
  "QA-Verified",
  "Deployment",
  "Done",
  "Re-Open",
];

const priorityStyles = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

const statusStyles = {
  "To-Do": "bg-slate-100 text-slate-700 border-slate-200",
  "In-Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Testing: "bg-amber-100 text-amber-700 border-amber-200",
  "QA-Verified": "bg-violet-100 text-violet-700 border-violet-200",
  Deployment: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Done: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Re-Open": "bg-rose-100 text-rose-700 border-rose-200",
};

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  assignees: [],
};

const getInitials = (member) => {
  const first = member?.firstname?.[0] || "";
  const last = member?.lastname?.[0] || "";
  return `${first}${last}`.toUpperCase() || "?";
};

const normalizeTask = (task) => {
  if (task.assignees?.length > 0) {
    return task;
  }

  if (task.assign_to) {
    return {
      ...task,
      assignees: [task.assign_to],
    };
  }

  return {
    ...task,
    assignees: [],
  };
};

const Kanban = () => {
  const { projectId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = currentUser.role || currentUser.system_role;

  const [columns, setColumns] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [boardError, setBoardError] = useState("");
  const [showTaskComposer, setShowTaskComposer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const dedupeTasks = (tasks) => {
    const map = new Map();
    tasks.forEach((task) => {
      map.set(task._id.toString(), task);
    });
    return Array.from(map.values());
  };

  const fetchTasks = async () => {
    const res = await api.get(`/task/project/${projectId}`);
    const uniqueTasks = dedupeTasks(res.data.map(normalizeTask));
    
    // Create a fresh object with new arrays to avoid shallow copy mutation
    const initial = statuses.reduce((acc, status) => {
      acc[status] = [];
      return acc;
    }, {});

    uniqueTasks.forEach((task) => {
      if (initial[task.status]) {
        initial[task.status].push(task);
      }
    });

    Object.keys(initial).forEach((key) => {
      initial[key] = dedupeTasks(initial[key]);
    });

    setColumns(initial);
  };

  const fetchProjectMembers = async () => {
    const [projectRes, companyMembersRes] = await Promise.all([
      api.get(`/project/${projectId}`),
      role === "ADMIN" ? api.get("/user/members") : Promise.resolve({ data: [] }),
    ]);

    const projectMembersData = projectRes.data.assigned_users || [];
    const companyMembers = companyMembersRes.data || [];
    const mergedMembers = role === "ADMIN"
      ? Array.from(
        new Map(
          [...projectMembersData, ...companyMembers].map((member) => [
            member._id,
            member,
          ])
        ).values()
      )
      : projectMembersData;
    const validMemberIds = new Set(mergedMembers.map((member) => member._id));

    setProjectMembers(mergedMembers);
    setProjectName(projectRes.data.name || "");
    setTaskForm((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((id) => validMemberIds.has(id)),
    }));
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setBoardError("");

      try {
        await Promise.all([fetchTasks(), fetchProjectMembers()]);
      } catch (err) {
        setBoardError(
          err.response?.data?.message || "Failed to load project board"
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [projectId]);

  const updateTaskForm = (field, value) => {
    setTaskForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setBoardError("");
  };

  const handleAssigneeToggle = (memberId) => {
    updateTaskForm(
      "assignees",
      taskForm.assignees.includes(memberId)
        ? taskForm.assignees.filter((id) => id !== memberId)
        : [...taskForm.assignees, memberId]
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) return;

    if (taskForm.assignees.length === 0) {
      setBoardError("Please select at least one assignee.");
      return;
    }

    setCreatingTask(true);
    setBoardError("");

    try {
      await api.post("/task", {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: "To-Do",
        priority: taskForm.priority,
        project_id: projectId,
        assignees: taskForm.assignees,
      });

      await fetchTasks();
      setTaskForm(emptyTaskForm);
    } catch (err) {
      setBoardError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const sourceItems = [...columns[source.droppableId]];
    const destinationItems =
      source.droppableId === destination.droppableId
        ? sourceItems
        : [...columns[destination.droppableId]];

    const [movedTask] = sourceItems.splice(source.index, 1);
    const updatedTask = { ...movedTask, status: destination.droppableId };

    destinationItems.splice(destination.index, 0, updatedTask);

    const nextColumns =
      source.droppableId === destination.droppableId
        ? {
          ...columns,
          [source.droppableId]: dedupeTasks(destinationItems),
        }
        : {
          ...columns,
          [source.droppableId]: dedupeTasks(sourceItems),
          [destination.droppableId]: dedupeTasks(destinationItems),
        };

    setColumns(nextColumns);
    setBoardError("");

    try {
      await api.patch(`/task/${draggableId}/status`, {
        status: destination.droppableId,
      });

      await fetchTasks();
    } catch (err) {
      setBoardError(
        err.response?.data?.message || "Failed to update task status"
      );
      await fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F6F7FB]">
      <header className="border-b bg-white px-6 py-5">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Project Board
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {projectName || "Kanban Board"}
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            {projectMembers.length} member{projectMembers.length === 1 ? "" : "s"} available
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {role === "ADMIN"
              ? "Create tasks only when you need them, then keep the board front and center."
              : "Track task movement and open a card to collaborate."}
          </p>

          {role === "ADMIN" && (
            <button
              type="button"
              onClick={() => setShowTaskComposer((prev) => !prev)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {showTaskComposer ? "Hide Task Form" : "New Task"}
            </button>
          )}
        </div>

        {boardError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {boardError}
          </div>
        )}

        {role === "ADMIN" && showTaskComposer && (
          <form
            onSubmit={handleCreateTask}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:grid-cols-[1.4fr,1.1fr,220px,180px]"
          >
            <div className="space-y-3">
              <input
                placeholder="Task title"
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                value={taskForm.title}
                onChange={(e) => updateTaskForm("title", e.target.value)}
              />
              <textarea
                rows={3}
                placeholder="Description for context, blockers, or acceptance notes"
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                value={taskForm.description}
                onChange={(e) => updateTaskForm("description", e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assign to
              </p>

              <div className="max-h-32 overflow-y-auto rounded-lg border bg-white p-2">
                {projectMembers.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-slate-400">
                    No project members found
                  </p>
                ) : (
                  projectMembers.map((member) => (
                    <label
                      key={member._id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={taskForm.assignees.includes(member._id)}
                          onChange={() => handleAssigneeToggle(member._id)}
                        />
                        <div>
                          <p className="font-medium text-slate-700">
                            {member.firstname} {member.lastname}
                          </p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </p>
                <select
                  className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
                  value={taskForm.priority}
                  onChange={(e) => updateTaskForm("priority", e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
                New tasks start in <span className="font-semibold text-slate-700">To-Do</span>.
              </div>
            </div>

            <button
              type="submit"
              className="h-fit self-end rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!taskForm.title.trim() || taskForm.assignees.length === 0 || creatingTask}
            >
              {creatingTask ? "Creating..." : "Add Task"}
            </button>
          </form>
        )}
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-5 p-6 md:grid-cols-2 2xl:grid-cols-3">
            {statuses.map((status) => (
              <div key={status} className="min-w-0">
                <div
                  className={`mb-3 flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    statusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold">{status}</h3>
                    <p className="text-xs opacity-80">
                      {columns[status]?.length || 0} task{columns[status]?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex min-h-[220px] flex-col gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200"
                    >
                      {columns[status]?.map((task, index) => (
                        <Draggable
                          key={task._id.toString()}
                          draggableId={task._id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              onClick={() => setSelectedTask(task)}
                              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    {task.task_id}
                                  </p>
                                  <p className="mt-1 font-medium text-slate-800">
                                    {task.title}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    priorityStyles[task.priority] || "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              <p className="min-h-[40px] text-sm text-slate-500">
                                {task.description?.trim()
                                  ? task.description
                                  : "No description yet"}
                              </p>

                              <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {task.assignees?.map((member) => (
                                    <span
                                      key={member._id}
                                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                      title={`${member.firstname} ${member.lastname}`}
                                    >
                                      {getInitials(member)}
                                    </span>
                                  ))}
                                </div>

                                <span className="text-xs text-slate-400">
                                  {task.assignees?.length || 0} assignee{task.assignees?.length === 1 ? "" : "s"}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {columns[status]?.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                          No tasks in {status}
                        </div>
                      )}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
};

export default Kanban;