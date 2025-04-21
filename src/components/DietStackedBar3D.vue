<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { Bar3DChart } from 'echarts-gl/charts';
import { Grid3DComponent } from 'echarts-gl/components';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { useDietData } from '../composables/useDietData';

// Register necessary components
use([
  CanvasRenderer,
  Bar3DChart,
  Grid3DComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// Use composable to load data
const { loading, error, dietData, loadData } = useDietData();

// Define environmental indicators
const indicators = [
  { value: 'ghgs', label: 'Greenhouse Gas Emissions', unit: 'kg CO₂ eq/day', color: '#5470c6', weight: 1 },
  { value: 'landUse', label: 'Land Use', unit: 'm²/day', color: '#91cc75', weight: 0.5 },
  { value: 'waterScarcity', label: 'Water Scarcity', unit: 'liters/day', color: '#fac858', weight: 0.03 },
  { value: 'eutrophication', label: 'Eutrophication', unit: 'g PO₄ eq/day', color: '#ee6666', weight: 0.2 },
  { value: 'acidification', label: 'Acidification', unit: 'g SO₂ eq/day', color: '#73c0de', weight: 0.2 },
  { value: 'mean_bio', label: 'Biodiversity Impact', unit: 'PDF/day', color: '#9a60b4', weight: 0.4 }
];

// Diet group display name mapping
const dietGroupDisplayNames: Record<string, string> = {
  'vegan': 'Vegan',
  'vegetarian': 'Vegetarian',
  'fish': 'Fish-eater',
  'low_meat': 'Low Meat',
  'medium_meat': 'Medium Meat',
  'high_meat': 'High Meat',
  'All': 'All Diets'
};

// Age group display name mapping
const ageGroupDisplayNames: Record<string, string> = {
  '20-29': '20-29 years',
  '30-39': '30-39 years',
  '40-49': '40-49 years',
  '50-59': '50-59 years',
  '60-69': '60-69 years',
  '70-79': '70-79 years',
  'Unknown': 'Unknown age',
  'All': 'All Ages'
};

// Filter data for diet-age combinations
const filteredData = computed(() => {
  if (dietData.value.length === 0) return [];
  
  // Get diet-age group combinations
  return dietData.value.filter(item => {
    // Exclude "All" entries in either category since we want specific combinations
    return item.dietGroup !== 'All' && item.ageGroup !== 'All' && item.gender === 'All';
  });
});

// Process data for 3D visualization
const processedData = computed(() => {
  if (filteredData.value.length === 0) return {
    dietGroups: [],
    ageGroups: [],
    seriesData: []
  };
  
  // Define custom order for diet groups
  const dietOrder = ['vegan', 'vegetarian', 'fish', 'low_meat', 'medium_meat', 'high_meat'];
  const ageOrder = ['20-29', '30-39', '40-49', '50-59', '60-69', '70-79', 'Unknown'];
  
  // Get unique diet groups and age groups
  const uniqueDietGroups = Array.from(new Set(filteredData.value.map(item => item.dietGroup)))
    .sort((a, b) => {
      const indexA = dietOrder.indexOf(a);
      const indexB = dietOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  
  const uniqueAgeGroups = Array.from(new Set(filteredData.value.map(item => item.ageGroup)))
    .sort((a, b) => {
      const indexA = ageOrder.indexOf(a);
      const indexB = ageOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  
  // Create a mapping to easily lookup diet/age indices
  const dietIndexMap = Object.fromEntries(uniqueDietGroups.map((diet, index) => [diet, index]));
  const ageIndexMap = Object.fromEntries(uniqueAgeGroups.map((age, index) => [age, index]));
  
  // Find maximum value for each indicator for normalization
  const maxValues: Record<string, number> = {};
  indicators.forEach(indicator => {
    const values = filteredData.value.map(d => d[indicator.value as keyof typeof d] as number);
    maxValues[indicator.value] = Math.max(...values);
  });
  
  // Group data by diet and age combinations
  const combinedData: Record<string, Record<string, Record<string, number>>> = {};
  
  // Initialize the data structure
  for (const dietGroup of uniqueDietGroups) {
    combinedData[dietGroup] = {};
    for (const ageGroup of uniqueAgeGroups) {
      combinedData[dietGroup][ageGroup] = {};
    }
  }
  
  // Fill in the values with normalization
  for (const item of filteredData.value) {
    if (!combinedData[item.dietGroup] || !combinedData[item.dietGroup][item.ageGroup]) continue;
    
    for (const indicator of indicators) {
      const rawValue = item[indicator.value as keyof typeof item] as number;
      
      // Apply normalization with custom weight
      const normalizedValue = (rawValue / maxValues[indicator.value]) * indicator.weight;
      
      combinedData[item.dietGroup][item.ageGroup][indicator.value] = normalizedValue;
    }
  }
  
  // Create series data for each indicator
  const seriesData = indicators.map(indicator => {
    const data = [];
    
    for (const dietGroup of uniqueDietGroups) {
      const xIndex = dietIndexMap[dietGroup];
      
      for (const ageGroup of uniqueAgeGroups) {
        const yIndex = ageIndexMap[ageGroup];
        
        // Get normalized value for this indicator
        const normalizedValue = combinedData[dietGroup]?.[ageGroup]?.[indicator.value] || 0;
        
        // Add data point [x, y, normalizedValue, indicatorName, rawValue]
        const item = filteredData.value.find(
          item => item.dietGroup === dietGroup && item.ageGroup === ageGroup
        );
        const rawValue = item ? (item[indicator.value as keyof typeof item] as number) : 0;
        
        data.push([xIndex, yIndex, normalizedValue, indicator.value, rawValue]);
      }
    }
    
    return {
      type: 'bar3D',
      name: indicator.label,
      data: data,
      stack: 'stack',
      shading: 'lambert',
      itemStyle: {
        color: indicator.color
      },
      emphasis: {
        label: {
          show: false
        }
      }
    };
  });
  
  return {
    dietGroups: uniqueDietGroups.map(d => dietGroupDisplayNames[d] || d),
    ageGroups: uniqueAgeGroups.map(a => ageGroupDisplayNames[a] || a),
    seriesData
  };
});

// Chart configuration
const chartOptions = computed(() => {
  if (!processedData.value.dietGroups || processedData.value.dietGroups.length === 0) {
    return {
      title: {
        text: 'Environmental Impact by Diet and Age Group',
        left: 'center',
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333'
        }
      }
    };
  }
  
  return {
    title: {
      text: 'Stacked Environmental Impact by Diet Type and Age Group',
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        // Find the corresponding diet and age groups
        const dietGroup = processedData.value.dietGroups[params.data[0]];
        const ageGroup = processedData.value.ageGroups[params.data[1]];
        const normalizedValue = params.data[2];
        const indicatorValue = params.data[3];
        const rawValue = params.data[4];
        
        // Find the indicator details
        const indicator = indicators.find(ind => ind.value === indicatorValue);
        
        if (!indicator) return '';
        
        // Format raw value for display
        const formattedRawValue = indicator.value === 'waterScarcity' 
          ? rawValue.toLocaleString('en-US', {maximumFractionDigits: 0})
          : rawValue.toFixed(2);
        
        return `<strong>${dietGroup}, ${ageGroup}</strong><br/>` +
               `${indicator.label}: ${normalizedValue.toFixed(2)} (score)<br/>` +
               `Raw value: ${formattedRawValue} ${indicator.unit}`;
      }
    },
    legend: {
      data: indicators.map(i => i.label),
      top: 'bottom'
    },
    grid3D: {
      viewControl: {
        // Set a better default viewing angle
        beta: 30,
        alpha: 20,
        autoRotate: false,
        rotateSensitivity: 1
      },
      light: {
        main: {
          intensity: 1.2
        },
        ambient: {
          intensity: 0.3
        }
      }
    },
    xAxis3D: {
      type: 'category',
      data: processedData.value.dietGroups,
      name: 'Diet Type',
      nameTextStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    yAxis3D: {
      type: 'category',
      data: processedData.value.ageGroups,
      name: 'Age Group',
      nameTextStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    zAxis3D: {
      type: 'value',
      name: 'Environmental Impact',
      nameTextStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    series: processedData.value.seriesData
  };
});

// Load data
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="chart-container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">Error loading data: {{ error }}</div>
    <template v-else>
      <v-chart class="chart" :option="chartOptions" autoresize />
    </template>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 630px;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.chart {
  flex: 1;
  min-height: 550px;
}

.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
}

.error {
  color: #d32f2f;
}
</style> 