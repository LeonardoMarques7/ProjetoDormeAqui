import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const TASK_TYPE_LABEL = {
  cleaning: "Limpeza",
  preparation: "Preparação",
  maintenance: "Manutenção",
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const TasksList = ({ tasks = [] }) => {
  const [doneMap, setDoneMap] = useState({});

  const normalizedTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        resolvedStatus: doneMap[task.id] ? "done" : task.status,
      })),
    [tasks, doneMap]
  );

  const toggleTask = (taskId, checked) => {
    setDoneMap((prev) => ({ ...prev, [taskId]: Boolean(checked) }));
  };

  return (
    <section className="host-dashboard-section">
      <h2 className="text-xl font-bold text-[#0F172B]">Tarefas operacionais</h2>
      <div className="mt-4 space-y-3">
        {normalizedTasks.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Nenhuma tarefa pendente.
          </p>
        )}
        {normalizedTasks.map((task) => {
          const isDone = task.resolvedStatus === "done";
          return (
            <article
              key={task.id}
              className={`rounded-2xl border px-4 py-3 shadow-sm ${
                isDone ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={(checked) => toggleTask(task.id, checked)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600">
                      {TASK_TYPE_LABEL[task.type] || "Operacional"}
                    </span>
                    {task.auto && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        automática
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{task.placeTitle}</span>
                    <span>•</span>
                    <span>{task.guestName}</span>
                    <span>•</span>
                    <span>{formatDateTime(task.dueDate)}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default TasksList;

