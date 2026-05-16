"use client";

import { useState, useEffect, useRef } from "react";

type Task = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: number;
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

function getTodayString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (!groups[task.date]) groups[task.date] = [];
    groups[task.date].push(task);
  }
  return groups;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("タスク名を入力してください");
      titleRef.current?.focus();
      return;
    }
    if (!date) {
      setError("日付を選択してください");
      return;
    }
    setError("");
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      date,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    titleRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = tasks.filter((t) => {
    if (filter === "active" && t.completed) return false;
    if (filter === "done" && !t.completed) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const isDateFiltered = dateFrom !== "" || dateTo !== "";

  const sortedDates = [
    ...new Set(filtered.map((t) => t.date)),
  ].sort();

  const grouped = groupByDate(filtered);

  const doneCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <main className="min-h-screen bg-[#f8f7f4] py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* ヘッダー */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            ToDo
          </h1>
          {totalCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {doneCount} / {totalCount} 件完了
            </p>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col gap-3">
            <div>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="タスクを入力..."
                className="w-full text-gray-800 placeholder-gray-300 bg-transparent outline-none text-base py-1"
              />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="text-gray-600 bg-transparent outline-none cursor-pointer text-sm"
                />
              </div>
              <button
                onClick={addTask}
                className="bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-150"
              >
                追加
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </div>

        {/* フィルター */}
        {totalCount > 0 && (
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {(["all", "active", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-150 ${
                    filter === f
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
                </button>
              ))}
            </div>

            {/* 日付範囲検索 */}
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
              />
              <span className="text-gray-300 text-sm">〜</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
              />
              {isDateFiltered && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="日付絞り込みをクリア"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* タスクリスト */}
        {totalCount === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">タスクがありません</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-sm">
            該当するタスクがありません
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    {formatDate(dateKey)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {grouped[dateKey]
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`task-enter group flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border transition-all duration-200 ${
                          task.completed
                            ? "border-gray-50 opacity-60"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        {/* チェックボックス */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          aria-label={task.completed ? "未完了に戻す" : "完了にする"}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed
                              ? "bg-emerald-400 border-emerald-400"
                              : "border-gray-200 hover:border-emerald-300"
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* タイトル */}
                        <span
                          className={`flex-1 text-sm leading-relaxed ${
                            task.completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* 削除ボタン */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          aria-label="削除"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150 p-1 rounded-lg hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 完了済み一括削除 */}
        {doneCount > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setTasks((prev) => prev.filter((t) => !t.completed))}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors duration-150"
            >
              完了済みを削除 ({doneCount}件)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
