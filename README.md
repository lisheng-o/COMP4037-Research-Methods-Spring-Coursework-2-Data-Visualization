# Environmental Impact Analysis Visualization of Diet Groups

This project visualizes the environmental impact data of different diet groups, including greenhouse gas emissions, land use, water scarcity, eutrophication, and acidification indicators.

## Features

- 3D stacked bar chart comparing various environmental impact indicators across different diet groups and age groups
- Normalized data visualization for better comparison between different environmental metrics
- Interactive 3D view with rotation and zoom capabilities
- Responsive design that adapts to different screen sizes

## Technology Stack

- Vue 3 (Composition API)
- TypeScript
- ECharts and ECharts-GL (for 3D visualization)
- Papa Parse (for CSV file parsing)
- Vite (build tool)

## Installation and Running

### Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn

# Or using bun
bun install
```

### Run in Development Mode

```bash
npm run dev
# Or
yarn dev
# Or
bun run dev
```

### Build for Production

```bash
npm run build
# Or
yarn build
# Or
bun run build
```

## Project Structure

- `src/components/`: Contains all Vue components
  - `DietStackedBar3D.vue`: 3D stacked bar chart component for visualizing environmental impacts by diet and age groups
- `src/composables/`: Reusable composition functions
  - `useDietData.ts`: Function for loading and processing CSV data
- `public/data/`: Data files
  - `Results_21Mar2022.csv`: CSV file containing environmental impact data for different diet groups
- `public/`: Static resource directory

## Data Normalization

The environmental impact data is normalized using the following formula:

```
NormalizedValue_{i,j} = (RawValue_{i,j} / MaxValue_{i}) × Weight_{i}
```

Where:
- NormalizedValue_{i,j} is the normalized value of indicator i at data point j
- RawValue_{i,j} is the original value of indicator i at data point j
- MaxValue_{i} is the maximum value of indicator i across all data points
- Weight_{i} is the weight factor for indicator i

## Data Source

The data comes from the paper **Scarborough, P., Clark, M., Cobiac, L. et al. Vegans, vegetarians, fish-eaters and meat-eaters in the UK show discrepant environmental impacts. Nat Food 4, 565–574 (2023). https://doi.org/10.1038/s43016-023-00795-w**.
