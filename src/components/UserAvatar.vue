<template>
  <a-tooltip :content="tooltipText">
    <div
      class="user-avatar"
      :style="{
        width: size + 'px',
        height: size + 'px',
        fontSize: fontSize + 'px'
      }"
    >
      {{ initials }}
    </div>
  </a-tooltip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 32,
  },
});

// Generate initials from name
const initials = computed(() => {
  if (!props.name) return '?';

  const parts = props.name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

// Font size based on avatar size
const fontSize = computed(() => {
  return Math.floor(props.size * 0.4);
});

// Tooltip text
const tooltipText = computed(() => {
  if (props.email) {
    return `${props.name} (${props.email})`;
  }
  return props.name;
});
</script>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  cursor: default;
  flex-shrink: 0;
}
</style>
