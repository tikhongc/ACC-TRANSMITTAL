<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// App root component - contains router-view for page rendering
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  background-color: #F7F8FA;
}

.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
