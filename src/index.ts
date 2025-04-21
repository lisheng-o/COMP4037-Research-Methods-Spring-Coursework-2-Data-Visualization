import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ECharts from 'vue-echarts';
import * as echarts from 'echarts/core';
import {
  BarChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { Bar3DChart } from 'echarts-gl/charts';
import { Grid3DComponent } from 'echarts-gl/components';


echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  Bar3DChart,
  Grid3DComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

createApp(App).component('v-chart', ECharts).mount('#app');
