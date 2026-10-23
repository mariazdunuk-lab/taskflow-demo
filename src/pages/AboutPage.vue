<template>
  <f7-page name="about">
    <f7-navbar title="Про застосунок" />
    <template #fixed><AppTabbar active="about" /></template>
    <main class="app-content">
      <section class="about-card">
        <img src="/icons/icon-192.png" width="72" height="72" alt="Логотип TaskFlow" class="app-logo" />
        <h1>TaskFlow</h1>
        <p class="about-description">Навчальний PWA-застосунок для керування завданнями, пріоритетами й контролю виконання.</p>
        <div class="technology-list" aria-label="Технології">
          <span>Vue 3</span><span>Framework7</span><span>Vite</span><span>PWA</span>
        </div>
        <p class="version">Версія 1.0.0</p>
      </section>
      <section class="info-card">
        <h2>Завдання завжди поруч</h2>
        <p>Застосунок адаптується до екрана телефона й комп’ютера. Після першого завантаження зібрана версія доступна офлайн.</p>
        <f7-button fill large href="/help/" class="primary-action">Правила використання</f7-button>
      </section>
    </main>
  </f7-page>
</template>

<script setup>
import AppTabbar from '../components/AppTabbar.vue';
</script>
