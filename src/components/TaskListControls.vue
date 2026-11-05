<script setup>
import { useId } from 'vue';

defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: 'all' },
  priority: { type: String, default: 'all' },
  sort: { type: String, default: 'newest' },
  onlyIncomplete: { type: Boolean, default: false },
});
const emit = defineEmits([
  'update:search', 'update:status', 'update:priority', 'update:sort', 'update:onlyIncomplete', 'reset',
]);
const prefix = useId();
</script>

<template>
  <section class="tf5-panel" :aria-labelledby="`${prefix}-heading`">
    <h2 :id="`${prefix}-heading`">Пошук і впорядкування</h2>
    <div class="tf5-controls-grid">
      <div class="tf5-control tf5-search">
        <label :for="`${prefix}-search`">Пошук за назвою та описом</label>
        <div class="tf5-search-row">
          <input :id="`${prefix}-search`" type="search" :value="search" autocomplete="off"
            placeholder="Наприклад: інтерфейс" @input="emit('update:search', $event.target.value)" />
          <button v-if="search.length" type="button" class="tf5-btn" @click="emit('update:search', '')">Очистити пошук</button>
        </div>
      </div>
      <div class="tf5-control">
        <label :for="`${prefix}-status`">Статус</label>
        <select :id="`${prefix}-status`" :value="status" @change="emit('update:status', $event.target.value)">
          <option value="all">Усі статуси</option>
          <option value="todo">Заплановано</option>
          <option value="progress">У роботі</option>
          <option value="done">Виконано</option>
        </select>
      </div>
      <div class="tf5-control">
        <label :for="`${prefix}-priority`">Пріоритет</label>
        <select :id="`${prefix}-priority`" :value="priority" @change="emit('update:priority', $event.target.value)">
          <option value="all">Усі пріоритети</option>
          <option value="high">Високий</option>
          <option value="medium">Середній</option>
          <option value="low">Низький</option>
        </select>
      </div>
      <div class="tf5-control tf5-sort">
        <label :for="`${prefix}-sort`">Сортування</label>
        <select :id="`${prefix}-sort`" :value="sort" @change="emit('update:sort', $event.target.value)">
          <option value="newest">Спочатку нові</option>
          <option value="title">За назвою (А–Я)</option>
          <option value="priority">За пріоритетом (високий перший)</option>
          <option value="priorityAsc">За пріоритетом (низький перший)</option>
          <option value="dueDate">За терміном (найближчий перший)</option>
          <option value="dueDateDesc">За терміном (найпізніший перший)</option>
          <option value="status">За статусом (у роботі → заплановано → виконано)</option>
        </select>
      </div>
    </div>
    <div class="tf5-controls-actions">
      <button type="button" class="tf5-btn" :class="{ 'is-active': onlyIncomplete }" :aria-pressed="onlyIncomplete"
        @click="emit('update:onlyIncomplete', !onlyIncomplete)">Тільки невиконані</button>
      <button type="button" class="tf5-btn" @click="emit('reset')">Скинути фільтри</button>
    </div>
  </section>
</template>
