import { handleApiResponse, isSuccessResponse } from "$lib/server";
import type { Profile, User } from "$lib/types";
import { fail, redirect, type Actions } from "@sveltejs/kit";
export const actions = {
  update: async ({ request, fetch, params }) => {
    const formData = await request.formData();

    if (params.role === "t") {
      const validateZoom = (url: string) => {
        if (!url) return false;
        return /^https?:\/\/(?:[a-z0-9-]+\.)?zoom\.us\/j\/\d{9,11}(?:\?pwd=[a-zA-Z0-9]+)?$/.test(
          url,
        );
      };

      if (!validateZoom(formData.get("zoomUrl") as string)) {
        return fail(400, { message: "Please enter a Zoom Room URL" });
      }
    }

    const validateEmail = (email: string) => {
      if (!email) return false;
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    if (!validateEmail(formData.get("email") as string)) {
      return fail(400, { message: "Invalid Email" });
    }

    const profileBody = {
      zoomUrl: formData.get("zoomUrl"),
      avatarUrl: formData.get("avatarUrl"),
      telegramId: formData.get("telegramId"),
    };

    const userBody = {
      email: formData.get("email"),
      username: formData.get("username"),
      name: formData.get("name"),
    };

    const [profileRes, userRes] = await Promise.all([
      fetch("/axum/profile", {
        method: "PATCH",
        body: JSON.stringify(profileBody),
      }),
      fetch("/axum/user", {
        method: "PATCH",
        body: JSON.stringify(userBody),
      }),
    ]);

    const profileResult = await handleApiResponse<Profile>(profileRes);
    if (!isSuccessResponse(profileResult)) {
      return fail(profileResult.status, { message: profileResult.message });
    }

    const userResult = await handleApiResponse<User>(userRes);
    if (!isSuccessResponse(userResult)) {
      return fail(userResult.status, { message: userResult.message });
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  },
  logout: async (event) => {
    event.cookies.delete("accessToken", { path: "/" });
    event.cookies.delete("refreshToken", { path: "/" });
    throw redirect(301, "/");
  },
} satisfies Actions;
