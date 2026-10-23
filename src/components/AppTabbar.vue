<template>
  <f7-toolbar bottom tabbar class="app-tabbar" aria-label="Основна навігація">
    <f7-link href="/" :class="{ 'app-link-active': active === 'home' }" :aria-current="active === 'home' ? 'page' : undefined">
      <f7-icon f7="house_fill" />
      <span class="tabbar-label">Головна</span>
    </f7-link>
    <f7-link href="/tasks/" :class="{ 'app-link-active': active === 'tasks' }" :aria-current="active === 'tasks' ? 'page' : undefined">
      <f7-icon f7="square_list_fill" />
      <span class="tabbar-label">Завдання</span>
    </f7-link>
    <f7-link href="/about/" :class="{ 'app-link-active': active === 'about' }" :aria-current="active === 'about' ? 'page' : undefined">
      <f7-icon f7="info_circle_fill" />
      <span class="tabbar-label">Про застосунок</span>
    </f7-link>
  </f7-toolbar>
</template>

<script setup>
defineProps({ active: { type: String, required: true } });
</script>
