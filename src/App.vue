<script setup>
import { ref } from 'vue';
import QueryForm from './components/QueryForm.vue';
import B50Result from './components/B50Result.vue';
import AllScoresResult from './components/AllScoresResult.vue';
import 'element-plus/dist/index.css';

const userData = ref(null);
const allScoresData = ref(null);
const displayMode = ref('b50');

const handleDataLoaded = (data, mode) => {
  if (mode === 'allScores') {
    allScoresData.value = data;
    userData.value = null;
  } else {
    userData.value = data;
    allScoresData.value = null;
  }
  displayMode.value = mode;
};
</script>

<template>
  <div class="app">
    <header>
      <h1>舞萌DX查询工具</h1>
    </header>

    <main>
      <QueryForm @dataLoaded="handleDataLoaded" />
      <B50Result v-if="displayMode === 'b50' && userData" :userData="userData" />
      <AllScoresResult v-if="displayMode === 'allScores' && allScoresData" :allScoresData="allScoresData" />
    </main>

    <footer>
      <p>© 2025 舞萌DX B50计算工具 | 作者：宇航员Dale</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f6f8fa;
  color: #333;
}

.app {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #409EFF;
  font-size: 32px;
  margin-bottom: 20px;
}

main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

footer {
  margin-top: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}
</style>
