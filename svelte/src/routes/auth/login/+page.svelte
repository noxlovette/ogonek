<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { Input, Turnstile, UniButton } from "$lib/components";
  import { initialUser, notification } from "$lib/stores";
  import { enhanceForm } from "$lib/utils";
  import { DoorOpen } from "lucide-svelte";
</script>

<div
  class="flex max-w-md flex-col items-center justify-center space-y-4 rounded-lg bg-white p-5 shadow-sm dark:bg-stone-900"
>
  <div class="text-center">
    <h2 class="text-cacao-600 text-3xl font-bold dark:text-stone-200">
      Welcome back
    </h2>
    <p class="mt-2 text-sm text-stone-600">
      Don't have an account?
      <a
        href="/auth/signup"
        class="text-cacao-500 hover:text-cacao-400 font-medium dark:text-stone-50 dark:hover:text-stone-200"
        >Sign up</a
      >
    </p>
  </div>
  <form
    method="POST"
    class="w flex flex-col items-center justify-center space-y-4"
    use:enhance={enhanceForm({
      handlers: {
        success: async (result) => {
          if (result.data) {
            const { user = initialUser } = result.data;

            notification.set({ message: "Welcome home", type: "success" });
            await goto(
              user.role === "teacher" ? "/t/dashboard" : "/s/dashboard",
            );
          }
        },
      },
    })}
  >
    <Input name="username" placeholder="Username" value="" />
    <Input name="password" placeholder="Password" value="" type="password" />
    <Turnstile />
    <UniButton Icon={DoorOpen} type="submit" variant="primary" fullWidth={true}
      >Login</UniButton
    >
  </form>
</div>

<svelte:head>
  <title>Login</title>
</svelte:head>
