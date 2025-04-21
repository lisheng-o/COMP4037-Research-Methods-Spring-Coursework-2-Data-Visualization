import { ref, computed } from 'vue';
import Papa from 'papaparse';

export interface DietData {
  dietGroup: string;
  gender: string;
  ageGroup: string;
  ghgs: number;
  landUse: number;
  waterScarcity: number;
  eutrophication: number;
  acidification: number;
  mean_bio: number;
}

export function useDietData() {
  const loading = ref(true);
  const error = ref<string | null>(null);
  const rawData = ref<any[]>([]);
  const dietData = ref<DietData[]>([]);
  
  const dietGroupMapping = {
    'vegan': 'vegan',
    'veggie': 'vegetarian',
    'fish': 'fish',
    'meat': 'low_meat',
    'meat50': 'medium_meat',
    'meat100': 'high_meat'
  };

  const genderMapping = {
    'female': 'Female',
    'male': 'Male'
  };

  const ageGroupMapping: Record<string, string> = {
    '20-29': '20-29',
    '30-39': '30-39',
    '40-49': '40-49',
    '50-59': '50-59',
    '60-69': '60-69',
    '70-79': '70-79'
  };
  
  const dietGroups = computed(() => {
    const groups = new Set<string>();
    dietData.value.forEach(item => groups.add(item.dietGroup));
    return Array.from(groups);
  });

  const genderGroups = computed(() => {
    const groups = new Set<string>();
    dietData.value.forEach(item => groups.add(item.gender));
    return Array.from(groups);
  });

  const ageGroups = computed(() => {
    const groups = new Set<string>();
    dietData.value.forEach(item => groups.add(item.ageGroup));
    return Array.from(groups);
  });

  // Helper function to clean strings (trim spaces and convert to lowercase)
  const cleanString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.toString().trim().toLowerCase();
  };

  // Helper function to safely convert values to numbers
  const safeParseFloat = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Remove any spaces and replace commas with dots
    const cleanValue = value.toString().trim().replace(/,/g, '.');
    return parseFloat(cleanValue) || 0;
  };

  const loadData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('./data/Results_21Mar2022.csv');
      
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      
      const csvData = await response.text();
      
      const parseResult = Papa.parse(csvData, { 
        header: true, 
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => {
          return header.trim().replace(/\s+/g, '_').toLowerCase();
        }
      });
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.error(parseResult.errors);
      }
      
      const data = parseResult.data as Record<string, any>[];
      
      // Clean data columns - identify column names
      const columnMap = {
        dietGroup: ['diet_group', 'dietgroup', 'diet'],
        gender: ['sex', 'gender'],
        ageGroup: ['age_group', 'agegroup', 'age'],
        ghgs: ['mean_ghgs', 'ghgs', 'greenhouse_gas'],
        landUse: ['mean_land', 'land', 'land_use'],
        waterScarcity: ['mean_watscar', 'water', 'water_scarcity'],
        eutrophication: ['mean_eut', 'eutrophication'],
        acidification: ['mean_acid', 'acidification'],
        mean_bio: ['mean_bio', 'biodiversity', 'bio']
      };
      
      // Find the actual column names from the CSV
      const actualColumns: Record<string, string> = {};
      
      if (data.length > 0) {
        const sampleRow = data[0] as Record<string, any>;
        const availableColumns = Object.keys(sampleRow);
        
        // For each of our expected columns, find the matching column in the CSV
        Object.entries(columnMap).forEach(([targetField, possibleNames]) => {
          const foundColumn = availableColumns.find(column => 
            possibleNames.includes(column.toLowerCase().trim())
          );
          
          if (foundColumn) {
            actualColumns[targetField] = foundColumn;
          }
        });
      }
      
      rawData.value = data;
      
      // Process by diet group
      const dietGroupsMap: Record<string, {
        ghgs: number[];
        landUse: number[];
        waterScarcity: number[];
        eutrophication: number[];
        acidification: number[];
        mean_bio: number[];
      }> = {};
      
      // Process by gender
      const genderGroupsMap: Record<string, {
        ghgs: number[];
        landUse: number[];
        waterScarcity: number[];
        eutrophication: number[];
        acidification: number[];
        mean_bio: number[];
      }> = {};

      // Process by age group
      const ageGroupsMap: Record<string, {
        ghgs: number[];
        landUse: number[];
        waterScarcity: number[];
        eutrophication: number[];
        acidification: number[];
        mean_bio: number[];
      }> = {};

      // Process by diet group and gender combined
      const dietGenderGroupsMap: Record<string, Record<string, {
        ghgs: number[];
        landUse: number[];
        waterScarcity: number[];
        eutrophication: number[];
        acidification: number[];
        mean_bio: number[];
      }>> = {};

      // Process by diet group and age group combined
      const dietAgeGroupsMap: Record<string, Record<string, {
        ghgs: number[];
        landUse: number[];
        waterScarcity: number[];
        eutrophication: number[];
        acidification: number[];
        mean_bio: number[];
      }>> = {};
      
      data.forEach((row: Record<string, any>) => {
        // Get values with fallbacks
        let dietGroup = cleanString(row[actualColumns.dietGroup]);
        let gender = cleanString(row[actualColumns.gender]);
        let ageGroup = cleanString(row[actualColumns.ageGroup]);
        
        if (!dietGroup) return;
        
        const standardDietGroup = dietGroupMapping[dietGroup as keyof typeof dietGroupMapping] || dietGroup;
        
        // Process gender data
        const standardGender = gender ? (genderMapping[gender as keyof typeof genderMapping] || 'Unknown') : 'Unknown';
        
        // Process age group data
        const standardAgeGroup = ageGroup ? (ageGroupMapping[ageGroup as keyof typeof ageGroupMapping] || 'Unknown') : 'Unknown';
        
        // Initialize diet group data
        if (!dietGroupsMap[standardDietGroup]) {
          dietGroupsMap[standardDietGroup] = {
            ghgs: [],
            landUse: [],
            waterScarcity: [],
            eutrophication: [],
            acidification: [],
            mean_bio: []
          };
        }
        
        // Initialize gender data
        if (!genderGroupsMap[standardGender]) {
          genderGroupsMap[standardGender] = {
            ghgs: [],
            landUse: [],
            waterScarcity: [],
            eutrophication: [],
            acidification: [],
            mean_bio: []
          };
        }

        // Initialize age group data
        if (!ageGroupsMap[standardAgeGroup]) {
          ageGroupsMap[standardAgeGroup] = {
            ghgs: [],
            landUse: [],
            waterScarcity: [],
            eutrophication: [],
            acidification: [],
            mean_bio: []
          };
        }
        
        // Initialize diet group and gender combined data
        if (!dietGenderGroupsMap[standardDietGroup]) {
          dietGenderGroupsMap[standardDietGroup] = {};
        }
        
        if (!dietGenderGroupsMap[standardDietGroup][standardGender]) {
          dietGenderGroupsMap[standardDietGroup][standardGender] = {
            ghgs: [],
            landUse: [],
            waterScarcity: [],
            eutrophication: [],
            acidification: [],
            mean_bio: []
          };
        }

        // Initialize diet group and age group combined data
        if (!dietAgeGroupsMap[standardDietGroup]) {
          dietAgeGroupsMap[standardDietGroup] = {};
        }
        
        if (!dietAgeGroupsMap[standardDietGroup][standardAgeGroup]) {
          dietAgeGroupsMap[standardDietGroup][standardAgeGroup] = {
            ghgs: [],
            landUse: [],
            waterScarcity: [],
            eutrophication: [],
            acidification: [],
            mean_bio: []
          };
        }
        
        // Parse numerical values, ensuring we clean any spaces or formatting issues
        const ghgs = safeParseFloat(row[actualColumns.ghgs]);
        const landUse = safeParseFloat(row[actualColumns.landUse]);
        const waterScarcity = safeParseFloat(row[actualColumns.waterScarcity]);
        const eutrophication = safeParseFloat(row[actualColumns.eutrophication]);
        const acidification = safeParseFloat(row[actualColumns.acidification]);
        const mean_bio = safeParseFloat(row[actualColumns.mean_bio]);
        
        // Add to diet group data
        if (!isNaN(ghgs)) dietGroupsMap[standardDietGroup].ghgs.push(ghgs);
        if (!isNaN(landUse)) dietGroupsMap[standardDietGroup].landUse.push(landUse);
        if (!isNaN(waterScarcity)) dietGroupsMap[standardDietGroup].waterScarcity.push(waterScarcity);
        if (!isNaN(eutrophication)) dietGroupsMap[standardDietGroup].eutrophication.push(eutrophication);
        if (!isNaN(acidification)) dietGroupsMap[standardDietGroup].acidification.push(acidification);
        if (!isNaN(mean_bio)) dietGroupsMap[standardDietGroup].mean_bio.push(mean_bio);
        
        // Add to gender data
        if (!isNaN(ghgs)) genderGroupsMap[standardGender].ghgs.push(ghgs);
        if (!isNaN(landUse)) genderGroupsMap[standardGender].landUse.push(landUse);
        if (!isNaN(waterScarcity)) genderGroupsMap[standardGender].waterScarcity.push(waterScarcity);
        if (!isNaN(eutrophication)) genderGroupsMap[standardGender].eutrophication.push(eutrophication);
        if (!isNaN(acidification)) genderGroupsMap[standardGender].acidification.push(acidification);
        if (!isNaN(mean_bio)) genderGroupsMap[standardGender].mean_bio.push(mean_bio);

        // Add to age group data
        if (!isNaN(ghgs)) ageGroupsMap[standardAgeGroup].ghgs.push(ghgs);
        if (!isNaN(landUse)) ageGroupsMap[standardAgeGroup].landUse.push(landUse);
        if (!isNaN(waterScarcity)) ageGroupsMap[standardAgeGroup].waterScarcity.push(waterScarcity);
        if (!isNaN(eutrophication)) ageGroupsMap[standardAgeGroup].eutrophication.push(eutrophication);
        if (!isNaN(acidification)) ageGroupsMap[standardAgeGroup].acidification.push(acidification);
        if (!isNaN(mean_bio)) ageGroupsMap[standardAgeGroup].mean_bio.push(mean_bio);
        
        // Add to combined diet + gender data
        if (!isNaN(ghgs)) dietGenderGroupsMap[standardDietGroup][standardGender].ghgs.push(ghgs);
        if (!isNaN(landUse)) dietGenderGroupsMap[standardDietGroup][standardGender].landUse.push(landUse);
        if (!isNaN(waterScarcity)) dietGenderGroupsMap[standardDietGroup][standardGender].waterScarcity.push(waterScarcity);
        if (!isNaN(eutrophication)) dietGenderGroupsMap[standardDietGroup][standardGender].eutrophication.push(eutrophication);
        if (!isNaN(acidification)) dietGenderGroupsMap[standardDietGroup][standardGender].acidification.push(acidification);
        if (!isNaN(mean_bio)) dietGenderGroupsMap[standardDietGroup][standardGender].mean_bio.push(mean_bio);

        // Add to combined diet + age group data
        if (!isNaN(ghgs)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].ghgs.push(ghgs);
        if (!isNaN(landUse)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].landUse.push(landUse);
        if (!isNaN(waterScarcity)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].waterScarcity.push(waterScarcity);
        if (!isNaN(eutrophication)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].eutrophication.push(eutrophication);
        if (!isNaN(acidification)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].acidification.push(acidification);
        if (!isNaN(mean_bio)) dietAgeGroupsMap[standardDietGroup][standardAgeGroup].mean_bio.push(mean_bio);
      });
            
      const processedData: DietData[] = [];
      
      // Process diet group data
      Object.entries(dietGroupsMap).forEach(([group, groupData]: [string, any]) => {
        const avgGhgs = groupData.ghgs.length > 0
          ? groupData.ghgs.reduce((sum: number, val: number) => sum + val, 0) / groupData.ghgs.length
          : 0;
        
        const avgLandUse = groupData.landUse.length > 0
          ? groupData.landUse.reduce((sum: number, val: number) => sum + val, 0) / groupData.landUse.length
          : 0;
        
        const avgWaterScarcity = groupData.waterScarcity.length > 0
          ? groupData.waterScarcity.reduce((sum: number, val: number) => sum + val, 0) / groupData.waterScarcity.length
          : 0;
        
        const avgEutrophication = groupData.eutrophication.length > 0
          ? groupData.eutrophication.reduce((sum: number, val: number) => sum + val, 0) / groupData.eutrophication.length
          : 0;
        
        const avgAcidification = groupData.acidification.length > 0
          ? groupData.acidification.reduce((sum: number, val: number) => sum + val, 0) / groupData.acidification.length
          : 0;
        
        const avgMean_bio = groupData.mean_bio.length > 0
          ? groupData.mean_bio.reduce((sum: number, val: number) => sum + val, 0) / groupData.mean_bio.length
          : 0;
        
        processedData.push({
          dietGroup: group,
          gender: 'All',
          ageGroup: 'All',
          ghgs: avgGhgs,
          landUse: avgLandUse,
          waterScarcity: avgWaterScarcity,
          eutrophication: avgEutrophication,
          acidification: avgAcidification,
          mean_bio: avgMean_bio
        });
      });
      
      // Process gender data
      Object.entries(genderGroupsMap).forEach(([gender, genderData]: [string, any]) => {
        const avgGhgs = genderData.ghgs.length > 0
          ? genderData.ghgs.reduce((sum: number, val: number) => sum + val, 0) / genderData.ghgs.length
          : 0;
        
        const avgLandUse = genderData.landUse.length > 0
          ? genderData.landUse.reduce((sum: number, val: number) => sum + val, 0) / genderData.landUse.length
          : 0;
        
        const avgWaterScarcity = genderData.waterScarcity.length > 0
          ? genderData.waterScarcity.reduce((sum: number, val: number) => sum + val, 0) / genderData.waterScarcity.length
          : 0;
        
        const avgEutrophication = genderData.eutrophication.length > 0
          ? genderData.eutrophication.reduce((sum: number, val: number) => sum + val, 0) / genderData.eutrophication.length
          : 0;
        
        const avgAcidification = genderData.acidification.length > 0
          ? genderData.acidification.reduce((sum: number, val: number) => sum + val, 0) / genderData.acidification.length
          : 0;
        
        const avgMean_bio = genderData.mean_bio.length > 0
          ? genderData.mean_bio.reduce((sum: number, val: number) => sum + val, 0) / genderData.mean_bio.length
          : 0;
        
        processedData.push({
          dietGroup: 'All',
          gender: gender,
          ageGroup: 'All',
          ghgs: avgGhgs,
          landUse: avgLandUse,
          waterScarcity: avgWaterScarcity,
          eutrophication: avgEutrophication,
          acidification: avgAcidification,
          mean_bio: avgMean_bio
        });
      });

      // Process age group data
      Object.entries(ageGroupsMap).forEach(([ageGroup, ageGroupData]: [string, any]) => {
        const avgGhgs = ageGroupData.ghgs.length > 0
          ? ageGroupData.ghgs.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.ghgs.length
          : 0;
        
        const avgLandUse = ageGroupData.landUse.length > 0
          ? ageGroupData.landUse.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.landUse.length
          : 0;
        
        const avgWaterScarcity = ageGroupData.waterScarcity.length > 0
          ? ageGroupData.waterScarcity.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.waterScarcity.length
          : 0;
        
        const avgEutrophication = ageGroupData.eutrophication.length > 0
          ? ageGroupData.eutrophication.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.eutrophication.length
          : 0;
        
        const avgAcidification = ageGroupData.acidification.length > 0
          ? ageGroupData.acidification.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.acidification.length
          : 0;
        
        const avgMean_bio = ageGroupData.mean_bio.length > 0
          ? ageGroupData.mean_bio.reduce((sum: number, val: number) => sum + val, 0) / ageGroupData.mean_bio.length
          : 0;
        
        processedData.push({
          dietGroup: 'All',
          gender: 'All',
          ageGroup: ageGroup,
          ghgs: avgGhgs,
          landUse: avgLandUse,
          waterScarcity: avgWaterScarcity,
          eutrophication: avgEutrophication,
          acidification: avgAcidification,
          mean_bio: avgMean_bio
        });
      });
      
      // Process combined diet group and gender data
      Object.entries(dietGenderGroupsMap).forEach(([dietGroup, genderMap]: [string, any]) => {
        Object.entries(genderMap).forEach(([gender, data]: [string, any]) => {
          const avgGhgs = data.ghgs.length > 0
            ? data.ghgs.reduce((sum: number, val: number) => sum + val, 0) / data.ghgs.length
            : 0;
          
          const avgLandUse = data.landUse.length > 0
            ? data.landUse.reduce((sum: number, val: number) => sum + val, 0) / data.landUse.length
            : 0;
          
          const avgWaterScarcity = data.waterScarcity.length > 0
            ? data.waterScarcity.reduce((sum: number, val: number) => sum + val, 0) / data.waterScarcity.length
            : 0;
          
          const avgEutrophication = data.eutrophication.length > 0
            ? data.eutrophication.reduce((sum: number, val: number) => sum + val, 0) / data.eutrophication.length
            : 0;
          
          const avgAcidification = data.acidification.length > 0
            ? data.acidification.reduce((sum: number, val: number) => sum + val, 0) / data.acidification.length
            : 0;
          
          const avgMean_bio = data.mean_bio.length > 0
            ? data.mean_bio.reduce((sum: number, val: number) => sum + val, 0) / data.mean_bio.length
            : 0;
          
          processedData.push({
            dietGroup,
            gender,
            ageGroup: 'All',
            ghgs: avgGhgs,
            landUse: avgLandUse,
            waterScarcity: avgWaterScarcity,
            eutrophication: avgEutrophication,
            acidification: avgAcidification,
            mean_bio: avgMean_bio
          });
        });
      });

      // Process combined diet group and age group data
      Object.entries(dietAgeGroupsMap).forEach(([dietGroup, ageMap]: [string, any]) => {
        Object.entries(ageMap).forEach(([ageGroup, data]: [string, any]) => {
          const avgGhgs = data.ghgs.length > 0
            ? data.ghgs.reduce((sum: number, val: number) => sum + val, 0) / data.ghgs.length
            : 0;
          
          const avgLandUse = data.landUse.length > 0
            ? data.landUse.reduce((sum: number, val: number) => sum + val, 0) / data.landUse.length
            : 0;
          
          const avgWaterScarcity = data.waterScarcity.length > 0
            ? data.waterScarcity.reduce((sum: number, val: number) => sum + val, 0) / data.waterScarcity.length
            : 0;
          
          const avgEutrophication = data.eutrophication.length > 0
            ? data.eutrophication.reduce((sum: number, val: number) => sum + val, 0) / data.eutrophication.length
            : 0;
          
          const avgAcidification = data.acidification.length > 0
            ? data.acidification.reduce((sum: number, val: number) => sum + val, 0) / data.acidification.length
            : 0;
          
          const avgMean_bio = data.mean_bio.length > 0
            ? data.mean_bio.reduce((sum: number, val: number) => sum + val, 0) / data.mean_bio.length
            : 0;
          
          processedData.push({
            dietGroup,
            gender: 'All',
            ageGroup,
            ghgs: avgGhgs,
            landUse: avgLandUse,
            waterScarcity: avgWaterScarcity,
            eutrophication: avgEutrophication,
            acidification: avgAcidification,
            mean_bio: avgMean_bio
          });
        });
      });
      
      dietData.value = processedData;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '';
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    rawData,
    dietData,
    dietGroups,
    genderGroups,
    ageGroups,
    loadData
  };
} 