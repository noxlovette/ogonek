import type { Profile, TeacherData, User } from "$lib/types";
import { writable } from "svelte/store";

export const initialUser: User = {
  username: "",
  sub: "",
  name: "",
  role: "",
  email: "",
};

export const initialProfile: Profile = {
  zoomUrl: "",
  avatarUrl: "",
};

export const initialTeacherData: TeacherData = {
  teacherZoomUrl: "",
  teacherTelegramId: "",
};

export const profile = writable<Profile>(initialProfile);
export const user = writable<User>(initialUser);
export const teacherData = writable<TeacherData>(initialTeacherData);
export function setProfile(data: Profile) {
  profile.update((currentState) => ({
    ...currentState,
    ...data,
  }));
}
export function setUser(data: User) {
  user.update((currentState) => ({
    ...currentState,
    ...data,
  }));
}
export function setTeacherData(data: TeacherData) {
  teacherData.update((currentState) => ({
    ...currentState,
    ...data,
  }));
}
export function clearUser() {
  user.update(() => ({
    username: "",
    sub: "",
    name: "",
    role: "",
    email: "",
  }));
}
