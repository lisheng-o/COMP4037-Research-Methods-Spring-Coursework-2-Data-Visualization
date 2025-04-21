<script setup lang="ts">
import DietStackedBar3D from './components/DietStackedBar3D.vue';
</script>

<template>
<div class="dashboard">
    <div class="content-wrapper">
      <div class="charts-container">
        <div class="chart-card">
          <DietStackedBar3D />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  width: 97vw;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.content-wrapper {
  width: 95%;
  max-width: 2000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.charts-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
  min-width: 0;
  height: 650px;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .content-wrapper {
    width: 100%;
  }
  
  .chart-card {
    width: 100%;
  }
}
</style>
