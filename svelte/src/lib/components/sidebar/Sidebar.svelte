<script lang="ts">
  import { sidebar } from "$lib/stores";

  import SidebarToggler from "../UI/interactive/SidebarToggler.svelte";
  import type { Component } from "svelte";

  let { elements }: { elements: Component[] } = $props();
</script>

<div
  class={`
   relative my-2 h-max flex-shrink-0 -translate-x-4 flex-col
   rounded-r-lg bg-stone-50 shadow-sm ring ring-stone-300/40 transition-all ease-in-out
   dark:bg-stone-900 dark:ring-stone-600/50
   ${$sidebar ? "w-1/12" : "w-1/6"}
   hidden md:flex md:text-lg lg:text-xl xl:text-2xl
 `}
>
  <div class="w-full overflow-hidden py-2">
    <SidebarToggler></SidebarToggler>
    <ul
      class={`
    flex flex-col space-y-5 py-3 ${$sidebar ? "items-center space-y-6 py-2" : " divide-stone-200/40 px-3 dark:divide-stone-600/80"}
  `}
    >
      {#each elements as Element}
        <Element />
      {/each}
    </ul>
  </div>
</div>
