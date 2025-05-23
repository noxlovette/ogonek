<script lang="ts">
  import { enhance } from "$app/forms";
  import { notification } from "$lib/stores";
  import { Upload, Loader2, Check } from "lucide-svelte";

  import { fade, scale } from "svelte/transition";

  let isDragging = $state(false);
  let isUploading = $state(false);
  let isSuccess = $state(false);
  let fileName = $state("");
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) {
      handleFileSelect(file);

      // Create a DataTransfer object and add the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Assign the files to the input element
      fileInput.files = dataTransfer.files;
    }
  }
  function handleFileSelect(file: File) {
    fileName = file.name;
  }

  function handleChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFileSelect(file);
  }
</script>

<div class="flex flex-col space-y-2">
  <form
    method="post"
    enctype="multipart/form-data"
    action="?/upload"
    class="flex h-full flex-col"
    use:enhance={({ formData, cancel }) => {
      if (!formData.has("file")) {
        cancel();
        notification.set({
          message: "Please select a file first",
          type: "error",
        });
        return;
      }

      isUploading = true;

      return async ({ result }) => {
        isUploading = false;
        if (result.type === "success") {
          isSuccess = true;
          notification.set({
            message: "File uploaded successfully!",
            type: "success",
          });
        } else if (result.type === "failure") {
          notification.set({
            message: String(result.data?.message ?? "An error occurred"),
            type: "error",
          });
        } else {
          notification.set({
            message: "An unknown error occurred",
            type: "error",
          });
        }
      };
    }}
  >
    <div
      onclick={() => fileInput.click()}
      onkeydown={(e) =>
        e.key === "Enter" || e.key === " " ? fileInput.click() : null}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="button"
      tabindex="0"
      aria-label="File upload area"
      class="relative flex flex-1 cursor-pointer
			 flex-col items-center justify-center rounded-lg border-2
			 border-dashed p-12 transition-colors duration-200
			 {isSuccess ? 'border-green-500' : ''}
			 {isDragging
        ? 'border-cacao-700 bg-cacao-100'
        : 'border-stone-300/30 hover:border-stone-400 dark:border-stone-600/30 dark:bg-stone-900 dark:hover:border-stone-700'}"
    >
      <input
        bind:this={fileInput}
        type="file"
        name="file"
        onchange={handleChange}
        class="hidden"
      />

      {#if isUploading}
        <div
          class="flex flex-col items-center gap-3"
          in:scale={{ duration: 200 }}
        >
          <Loader2 class="text-cacao-500 h-10 w-10 animate-spin" />
          <p class="text-stone-600">Uploading {fileName}...</p>
        </div>
      {:else if isSuccess}
        <div class="flex flex-col items-center gap-3" in:fade>
          <Check class="size-10 text-green-600" />
          <div class="text-center">
            <p class="">
              {fileName} has been uploaded
            </p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-3" in:fade>
          <Upload
            class="h-10 w-10 {fileName ? 'text-cacao-500' : 'text-stone-400'}"
          />
          <div class="text-center">
            <p class=" text-stone-600">
              {fileName || "Drag and drop your file here, or click to select"}
            </p>
          </div>
        </div>
      {/if}
    </div>

    <button
      type="submit"
      disabled={isUploading || !fileName}
      class="mt-4 flex w-full items-center justify-center
			 gap-2 rounded-md px-4 py-2
			 transition-colors duration-200
			 {isUploading || !fileName
        ? 'cursor-not-allowed bg-stone-200 text-stone-500'
        : 'bg-cacao-500 hover:bg-cacao-600 text-white'}"
    >
      {#if isUploading}
        <Loader2 class="h-4 w-4 animate-spin" />
        Uploading...
      {:else}
        Upload File
      {/if}
    </button>
  </form>
</div>
