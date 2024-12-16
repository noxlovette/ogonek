import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

const VITE_API_URL = "http://backend:8000";


export const load: PageServerLoad = async ({ params, cookies }) => {
  const { slug } = params;
  const sessionid = cookies.get('sessionid');
  const csrfToken = cookies.get('csrftoken') || '';
  const headers = {
    'Cookie': `sessionid=${sessionid}; csrftoken=${csrfToken}`
  };

  try {
    const response = await fetch(`${VITE_API_URL}/api/lessons/${slug}/`, {
      headers: headers
    });

    if (!response.ok) {
      // Check for unauthorized access or similar errors
      if (response.status === 403 || response.status === 401) {
        throw error(403, "You do not have permission to access this lesson.");
      }
      // For other errors, you might want to handle them differently
      const errorData = await response.json();
      throw error(response.status, errorData.message || "Error fetching lesson");
    }

    const lesson = await response.json();

    // if (!lesson || !lesson.assignee || lesson.assignee !== sessionid) {
    //   // Check if the lesson is assigned to the current user
   //    // Note: This assumes 'assignee' in the lesson object is the sessionid of the user
   //    throw error(403, "You do not have permission to access this lesson.");
   //  }

    return {
      lesson,
    };
  } catch (err) {
    // If any error occurs, propagate it to SvelteKit's error handling
    throw err;
  }
};

export const actions = {
  bookmark: async ({ request, cookies }) => {
    const formData = await request.formData();
    const sessionid = cookies.get('sessionid');
    const csrfToken = cookies.get('csrftoken');

    let body = {
      id: formData.get("id"),
      bookmarked: formData.get("bookmarked"),
    };


    try {
      const response = await fetch(
        `${VITE_API_URL}/api/lessons/${formData.get("id")}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `sessionid=${sessionid}; csrftoken=${csrfToken}`,
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Parse error details
        console.error("Error updating lesson:", errorData);
        return {
          success: false,
          error: errorData,
        };
      }

      return {
        success: true,
        message: "Lesson updated successfully",
      };
    } catch (error) {
      console.error("Fetch error:", error);
      return {
        success: false,
        error: "An error occurred while updating the lesson",
      };
    }
  },
} satisfies Actions;