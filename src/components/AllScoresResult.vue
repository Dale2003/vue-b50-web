<template>
  <div class="all-scores-result">
    <div v-if="allScoresData" class="scores-content">
      <!-- 用户信息 -->
      <div class="user-info">
        <h2>{{ allScoresData.nickname || '未知用户' }}</h2>
        <p>用户名: {{ allScoresData.username || '未设置' }}</p>
        <p>Rating: {{ allScoresData.rating || 0 }}</p>
        <p>称号: {{ allScoresData.plate || '无' }}</p>
        <p>总成绩数: {{ allScoresData.records ? allScoresData.records.length : 0 }}</p>
      </div>

      <!-- 分数统计 -->
      <div class="score-stats">
        <h3>分数统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">SSS+:</span>
            <span class="stat-value">{{ getGradeCount('sssp') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">SSS:</span>
            <span class="stat-value">{{ getGradeCount('sss') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">SS+:</span>
            <span class="stat-value">{{ getGradeCount('ssp') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">SS:</span>
            <span class="stat-value">{{ getGradeCount('ss') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">S+:</span>
            <span class="stat-value">{{ getGradeCount('sp') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">S:</span>
            <span class="stat-value">{{ getGradeCount('s') }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-filters">
        <el-input
          v-model="searchText"
          placeholder="搜索歌曲名称"
          prefix-icon="Search"
          style="width: 300px; margin-right: 10px;"
        />
        <el-select v-model="filterGrade" placeholder="筛选评级" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="all" />
          <el-option label="SSS+" value="sssp" />
          <el-option label="SSS" value="sss" />
          <el-option label="SS+" value="ssp" />
          <el-option label="SS" value="ss" />
          <el-option label="S+" value="sp" />
          <el-option label="S" value="s" />
          <el-option label="AAA" value="aaa" />
          <el-option label="AA" value="aa" />
          <el-option label="A" value="a" />
        </el-select>
        <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px; margin-right: 10px;">
          <el-option label="达成率降序" value="achievement_desc" />
          <el-option label="达成率升序" value="achievement_asc" />
          <el-option label="歌曲ID" value="song_id" />
        </el-select>
        <el-switch
          v-model="displayMode"
          active-text="卡片视图"
          inactive-text="表格视图"
          style="margin-left: 10px;"
        />
      </div>

      <!-- B50风格卡片展示 -->
      <div v-if="displayMode" class="charts-section">
        <h3>筛选结果 ({{ filteredScores.length }} 首)</h3>
        <div class="charts-grid">
          <div v-for="(chart, index) in paginatedScores" :key="`chart-${index}`" class="chart-item">
            <div class="chart-header" :class="getDifficultyClass(chart.level_index)">
              <span class="chart-title">{{ chart.title || `歌曲ID: ${chart.song_id}` }}</span>
              <span class="chart-level">{{ getDifficultyText(chart.level_index) }}</span>
            </div>
            <div class="chart-content">
              <div class="chart-row">
                <!-- 封面图片 -->
                <div class="chart-cover">
                  <img :src="getCoverImageUrl(chart.song_id)" @error="handleImageError($event, chart.song_id)" alt="歌曲封面" class="cover-img">
                  <span class="chart-type">{{ chart.type || 'DX' }}</span>
                </div>
                
                <div class="chart-stats">
                  <div class="chart-achievement" :class="getGradeClass(chart.achievements)">
                    {{ formatAchievement(chart.achievements) }}%
                  </div>
                  <div class="chart-details">
                    <span class="chart-ds" v-if="chart.ds">{{ parseFloat(chart.ds).toFixed(1) }}</span>
                    <span class="chart-ra" v-if="chart.ra">{{ chart.ra }}</span>
                    <span v-if="chart.fc" :class="getFcClass(chart.fc)">{{ formatFcText(chart.fc) }}</span>
                    <span v-if="chart.fs" :class="getFsClass(chart.fs)">{{ formatFsText(chart.fs) }}</span>
                  </div>
                  <div class="chart-dx-score" v-if="chart.dxScore">
                    <div class="dx-score-container">
                      <span>{{ chart.dxScore }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格展示 -->
      <div v-else class="scores-table">
        <el-table 
          :data="paginatedScores" 
          style="width: 100%"
          :height="600"
          stripe
        >
          <el-table-column prop="song_id" label="歌曲ID" width="80" />
          <el-table-column prop="title" label="歌曲名称" min-width="200" />
          <el-table-column prop="level_index" label="难度" width="80">
            <template #default="scope">
              <span :class="getDifficultyClass(scope.row.level_index)">
                {{ getDifficultyText(scope.row.level_index) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="achievements" label="达成率" width="100">
            <template #default="scope">
              <span :class="getGradeClass(scope.row.achievements)">
                {{ formatAchievement(scope.row.achievements) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="fc" label="FC" width="80" />
          <el-table-column prop="fs" label="FS" width="80" />
          <el-table-column prop="dxScore" label="DX分数" width="100" />
          <el-table-column prop="sync" label="同步" width="80" />
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="filteredScores.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>

      <!-- 导出功能 -->
      <div class="actions">
        <el-button type="primary" @click="exportData">导出全部数据</el-button>
        <el-button @click="exportFilteredData">导出筛选数据</el-button>
      </div>
    </div>
    
    <div v-else class="no-data">
      <p>暂无数据，请先进行查询</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'AllScoresResult',
  props: {
    allScoresData: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const searchText = ref('');
    const filterGrade = ref('all');
    const sortBy = ref('achievement_desc');
    const currentPage = ref(1);
    const pageSize = ref(50);
    const displayMode = ref(false); // 新增视图模式状态

    // 获取评级
    const getGrade = (achievement) => {
      if (achievement >= 100.5) return 'sssp';
      if (achievement >= 100) return 'sss';
      if (achievement >= 99.5) return 'ssp';
      if (achievement >= 99) return 'ss';
      if (achievement >= 98) return 'sp';
      if (achievement >= 97) return 's';
      if (achievement >= 94) return 'aaa';
      if (achievement >= 90) return 'aa';
      if (achievement >= 80) return 'a';
      return 'lower';
    };

    // 统计各评级数量
    const getGradeCount = (grade) => {
      if (!props.allScoresData?.records) return 0;
      return props.allScoresData.records.filter(record => 
        getGrade(record.achievements) === grade
      ).length;
    };

    // 难度文本
    const getDifficultyText = (levelIndex) => {
      const difficulties = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master'];
      return difficulties[levelIndex] || 'Unknown';
    };

    // 难度样式类
    const getDifficultyClass = (levelIndex) => {
      const classes = ['basic', 'advanced', 'expert', 'master', 'remaster'];
      return `difficulty-${classes[levelIndex] || 'unknown'}`;
    };

    // 评级样式类
    const getGradeClass = (achievement) => {
      const grade = getGrade(achievement);
      return `grade-${grade}`;
    };

    // 筛选后的分数数据
    const filteredScores = computed(() => {
      if (!props.allScoresData?.records) return [];
      
      let filtered = props.allScoresData.records.filter(record => {
        // 搜索过滤
        const matchSearch = !searchText.value || 
          (record.title && record.title.toLowerCase().includes(searchText.value.toLowerCase()));
        
        // 评级过滤
        const matchGrade = filterGrade.value === 'all' || 
          getGrade(record.achievements) === filterGrade.value;
        
        return matchSearch && matchGrade;
      });

      // 排序
      if (sortBy.value === 'achievement_desc') {
        filtered.sort((a, b) => (b.achievements || 0) - (a.achievements || 0));
      } else if (sortBy.value === 'achievement_asc') {
        filtered.sort((a, b) => (a.achievements || 0) - (b.achievements || 0));
      } else if (sortBy.value === 'song_id') {
        filtered.sort((a, b) => a.song_id - b.song_id);
      }

      return filtered;
    });

    // 分页数据
    const paginatedScores = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredScores.value.slice(start, end);
    });

    // 监听筛选条件变化，重置到第一页
    watch([searchText, filterGrade, sortBy], () => {
      currentPage.value = 1;
    });

    // 导出全部数据
    const exportData = () => {
      try {
        const dataBlob = new Blob([JSON.stringify(props.allScoresData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = `${props.allScoresData.nickname}_all_scores_${new Date().getTime()}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        ElMessage.success('全部数据已成功导出');
      } catch (error) {
        console.error('导出数据失败:', error);
        ElMessage.error('导出数据失败，请稍后再试');
      }
    };

    // 导出筛选数据
    const exportFilteredData = () => {
      try {
        const filteredData = {
          ...props.allScoresData,
          records: filteredScores.value
        };
        
        const dataBlob = new Blob([JSON.stringify(filteredData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = `${props.allScoresData.nickname}_filtered_scores_${new Date().getTime()}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        ElMessage.success('筛选数据已成功导出');
      } catch (error) {
        console.error('导出数据失败:', error);
        ElMessage.error('导出数据失败，请稍后再试');
      }
    };

    // 格式化成绩数值
    const formatAchievement = (achievement) => {
      if (typeof achievement === 'number') {
        return achievement.toFixed(4);
      } else if (typeof achievement === 'string') {
        const num = parseFloat(achievement);
        return isNaN(num) ? '0.0000' : num.toFixed(4);
      }
      return '0.0000';
    };

    // 获取封面图片URL
    const getCoverImageUrl = (songId) => {
      return `/covers/${songId}.png`;
    };

    // 处理图片加载错误
    const handleImageError = (event, songId) => {
      // 使用默认图片
      event.target.src = '/covers/0.png';
    };

    // 格式化FC文本显示
    const formatFcText = (fcValue) => {
      if (!fcValue) return '';
      const fc = fcValue.toLowerCase();
      if (fc === 'fcp') return 'fc+';
      if (fc === 'app') return 'ap+';
      return fcValue;
    };

    // 获取FC的CSS类名
    const getFcClass = (fcValue) => {
      if (!fcValue) return '';
      const fc = fcValue.toLowerCase();
      if (fc === 'fc' || fc === 'fcp') return 'chart-fc-green';
      if (fc === 'ap' || fc === 'app') return 'chart-fc-orange';
      return 'chart-fc-green';
    };

    // 格式化FS文本显示
    const formatFsText = (fsValue) => {
      if (!fsValue) return '';
      const fs = fsValue.toLowerCase();
      if (fs === 'fsp') return 'fs+';
      if (fs === 'fsd') return 'fdx';
      if (fs === 'fsdp') return 'fdx+';
      return fsValue;
    };

    // 获取FS的CSS类名
    const getFsClass = (fsValue) => {
      if (!fsValue) return '';
      const fs = fsValue.toLowerCase();
      if (fs === 'sync') return 'chart-fs-blue';
      if (fs === 'fs' || fs === 'fsp') return 'chart-fs-green';
      if (fs === 'fsd' || fs === 'fsdp') return 'chart-fs-orange';
      return 'chart-fs-green';
    };

    return {
      searchText,
      filterGrade,
      sortBy,
      currentPage,
      pageSize,
      displayMode,
      filteredScores,
      paginatedScores,
      getGradeCount,
      getDifficultyText,
      getDifficultyClass,
      getGradeClass,
      formatAchievement,
      getCoverImageUrl,
      handleImageError,
      formatFcText,
      getFcClass,
      formatFsText,
      getFsClass,
      exportData,
      exportFilteredData
    };
  }
};
</script>

<style scoped>
.all-scores-result {
  background-color: white;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1400px;
  box-sizing: border-box;
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.user-info p {
  margin: 5px 0;
  font-size: 14px;
}

.score-stats {
  margin-bottom: 20px;
}

.score-stats h3 {
  margin-bottom: 10px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.stat-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.stat-label {
  font-weight: bold;
  margin-right: 5px;
}

.stat-value {
  color: #409EFF;
  font-weight: bold;
}

.search-filters {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.scores-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.actions {
  text-align: center;
}

.actions .el-button {
  margin: 0 10px;
}

/* 难度颜色 */
.difficulty-basic { color: #4CAF50; }
.difficulty-advanced { color: #FF9800; }
.difficulty-expert { color: #F44336; }
.difficulty-master { color: #9C27B0; }
.difficulty-remaster { color: #E91E63; }

/* 评级颜色 */
.grade-sssp { color: #FFD700; font-weight: bold; }
.grade-sss { color: #FFD700; }
.grade-ssp { color: #C0C0C0; font-weight: bold; }
.grade-ss { color: #C0C0C0; }
.grade-sp { color: #CD7F32; font-weight: bold; }
.grade-s { color: #CD7F32; }
.grade-aaa { color: #409EFF; }
.grade-aa { color: #67C23A; }
.grade-a { color: #E6A23C; }

.no-data {
  text-align: center;
  color: #909399;
  padding: 40px;
}

/* B50风格卡片展示样式 */
.charts-section {
  margin-bottom: 30px;
}

.charts-section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #333;
}

/* 卡片网格布局 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

/* 移动端布局：一行一个 */
@media (max-width: 767px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 平板布局：一行两个 */
@media (min-width: 768px) and (max-width: 991px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 小屏电脑布局：一行三个 */
@media (min-width: 992px) and (max-width: 1199px) {
  .charts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 大屏电脑布局：一行四个 */
@media (min-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.chart-item {
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-header {
  padding: 8px 12px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header.basic {
  background-color: #6cd75e;
}

.chart-header.advanced {
  background-color: #fbba33;
}

.chart-header.expert {
  background-color: #f76e65;
}

.chart-header.master {
  background-color: #9061f9;
}

.chart-header.remaster {
  background-color: #bb5cf1;
}

.chart-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.chart-level {
  font-size: 12px;
  opacity: 0.9;
}

.chart-content {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chart-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
}

.chart-cover {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

/* 移动端封面稍大 */
@media (max-width: 767px) {
  .chart-cover {
    width: 120px;
    height: 120px;
  }
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.chart-type {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 0 4px 0 4px;
}

.chart-stats {
  width: 100%;
  margin-left: 12px;
  text-align: left;
  flex: 1;
}

.chart-achievement {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.chart-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 6px;
}

.chart-ds, .chart-ra {
  background-color: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.chart-dx-score {
  font-size: 13px;
  color: #606266;
}

.dx-score-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* FC样式 */
.chart-fc-green {
  background-color: #f0f9eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #67c23a;
}

.chart-fc-orange {
  background-color: #fef0e6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
}

/* FS样式 */
.chart-fs-blue {
  background-color: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
}

.chart-fs-green {
  background-color: #f0f9eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #67c23a;
}

.chart-fs-orange {
  background-color: #fef0e6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .all-scores-result {
    margin: 10px;
    padding: 15px;
    width: calc(100% - 20px);
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filters .el-input,
  .search-filters .el-select {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>