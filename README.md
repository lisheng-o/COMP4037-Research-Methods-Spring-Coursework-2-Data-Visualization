# 饮食组环境影响分析可视化

这个项目旨在可视化不同饮食组的环境影响数据，包括温室气体排放、土地使用、水资源稀缺性、富营养化和酸化等指标。

## 功能

- 使用条形图比较不同饮食组之间的各种环境影响指标
- 使用雷达图展示不同饮食组在多个环境指标上的表现
- 允许用户交互选择要显示的指标和饮食组
- 响应式设计，适应不同屏幕尺寸

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- ECharts (图表可视化)
- Papa Parse (CSV文件解析)
- Farm (构建工具)

## 安装和运行

### 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn

# 或使用bun
bun install
```

### 开发模式运行

```bash
npm run dev
# 或
yarn dev
# 或
bun run dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
bun run build
```

## 项目结构

- `src/components/`: 包含所有Vue组件
  - `DietGas.vue`: 条形图组件，用于比较饮食组的环境影响
  - `DietRadar.vue`: 雷达图组件，比较饮食组在多个环境指标上的表现
- `src/composables/`: 可复用的组合式函数
  - `useDietData.ts`: 加载和处理CSV数据的函数
- `src/data/`: 数据文件
  - `Results_21Mar2022.csv`: 包含不同饮食组环境影响数据的CSV文件
- `public/`: 静态资源目录

## 数据来源

数据来源自Results_21Mar2022.csv文件，包含不同饮食组（如肉食、素食、鱼食等）的多种环境影响指标。

## 许可证

根据实际情况添加许可证信息
