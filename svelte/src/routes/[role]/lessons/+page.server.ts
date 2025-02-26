import type { Lesson, PaginatedResponse } from "$lib/types";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const page = url.searchParams.get("page") || "1";
  const per_page = url.searchParams.get("per_page") || "50";
  const search = url.searchParams.get("search") || "";

  console.log("LOAD FUNCTION RUNNING WITH SEARCH:", search);

  const lessonsPaginated = await fetch(
    `/axum/lesson?page=${page}&per_page=${per_page}&search=${search}`,
  ).then((res) => res.json() as Promise<PaginatedResponse<Lesson>>);

  console.log("RECEIVED DATA:", lessonsPaginated.data.length, "ITEMS");
  return {
    lessonsPaginated,
  };
};

export const actions: Actions = {
  new: async ({ fetch }) => {
    const body = {
      title: "New Lesson",
      markdown: "## Try adding some content here",
      topic: "General",
    };

    const response = await fetch(`/axum/lesson`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const { id } = await response.json();

    if (response.ok) {
      return redirect(301, `/t/lessons/l/${id}/edit`);
    }
  },
};
