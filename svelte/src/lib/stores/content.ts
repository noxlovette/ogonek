import type { LessonSmall, Student, TaskSmall } from "$lib/types";
import { writable } from "svelte/store";

const createLessonStore = () => {
  const { subscribe, set, update } = writable<LessonSmall[]>([]);

  return {
    subscribe,
    setLessons: (lessons: LessonSmall[]) => set(lessons),
    addLesson: (lesson: LessonSmall) =>
      update((lessons) => [...lessons, lesson]),
    reset: () => set([]),
  };
};

const createTaskStore = () => {
  const { subscribe, set, update } = writable<TaskSmall[]>([]);

  return {
    subscribe,
    setTasks: (tasks: TaskSmall[]) => set(tasks),
    addTask: (task: TaskSmall) => update((tasks) => [...tasks, task]),
    reset: () => set([]),
  };
};

const createStudentStore = () => {
  const { subscribe, set, update } = writable<Student[]>([]);

  return {
    subscribe,
    setStudents: (students: Student[]) => set(students),
    addStudent: (student: Student) =>
      update((students) => [...students, student]),
    reset: () => set([]),
  };
};
export const taskStore = createTaskStore();
export const lessonStore = createLessonStore();
export const studentStore = createStudentStore();

export const isSearchOpen = writable(false);

export const tableQuery = writable("");
