<template>
  <div class="all-scores-result" ref="allScoresContainer">
    <div v-if="allScoresData" class="scores-content">
      <!-- 用户信息 -->
      <div class="user-info">
        <h2>{{ allScoresData.nickname || '未知用户' }}</h2>
        <div class="print-only-info">
          <p>用户名: {{ allScoresData.username || '未设置' }} | Rating: {{ allScoresData.rating || 0 }}</p>
          <p v-if="getActiveFilters().length > 0">筛选条件: {{ getActiveFilters().join(' | ') }}</p>
        </div>
        <div class="screen-only-info">
          <p>用户名: {{ allScoresData.username || '未设置' }}</p>
          <p>Rating: {{ allScoresData.rating || 0 }}</p>
          <p>称号: {{ allScoresData.plate || '无' }}</p>
          <p>总成绩数: {{ getValidRecordsCount() }}</p>
        </div>
      </div>

      <!-- 分数统计 -->
      <div class="score-stats screen-only">
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
      <div class="search-filters screen-only">
        <div class="filter-row">
          <el-input
            v-model="searchText"
            placeholder="搜索歌曲名称"
            prefix-icon="Search"
            style="width: 250px;"
          />
          <el-select v-model="filterDifficulty" placeholder="筛选难度" style="width: 120px;">
            <el-option label="全部难度" value="all" />
            <el-option label="Basic" value="0" />
            <el-option label="Advanced" value="1" />
            <el-option label="Expert" value="2" />
            <el-option label="Master" value="3" />
            <el-option label="Re:Master" value="4" />
          </el-select>
          <el-select v-model="filterLevel" placeholder="筛选等级" style="width: 120px;" @change="onLevelChange">
            <el-option label="全部等级" value="all" />
            <el-option v-for="level in levelOptions" :key="level" :label="level" :value="level" />
          </el-select>
        </div>
        <div class="filter-row">
          <el-select 
            v-model="filterDs" 
            placeholder="筛选定数" 
            style="width: 140px;"
            :disabled="filterLevel === 'all'"
          >
            <el-option label="全部定数" value="all" />
            <el-option 
              v-for="ds in availableDsOptions" 
              :key="ds.value" 
              :label="ds.label" 
              :value="ds.value" 
            />
          </el-select>
          <el-select v-model="filterGrade" placeholder="筛选评级" style="width: 120px;">
            <el-option label="全部评级" value="all" />
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
          <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px;">
            <el-option label="达成率降序" value="achievement_desc" />
            <el-option label="达成率升序" value="achievement_asc" />
            <el-option label="定数降序" value="ds_desc" />
            <el-option label="定数升序" value="ds_asc" />
            <el-option label="歌曲ID" value="song_id" />
          </el-select>
        </div>
        <div class="filter-row">
          <div class="button-group">
            <el-switch
              v-model="displayMode"
              active-text="卡片视图"
              inactive-text="表格视图"
            />
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
            <el-button v-if="displayMode" type="success" @click="generateImage">生成图片</el-button>
          </div>
        </div>
      </div>

      <!-- B50风格卡片展示 -->
      <div v-if="displayMode" class="charts-section">
        <div class="charts-header">
          <h3>筛选结果 ({{ filteredScores.length }} 首)</h3>
          <!-- 每页数量选择 -->
          <div class="page-size-control">
            <span>每页显示：</span>
            <el-select v-model="pageSize" style="width: 80px;" size="small">
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
              <el-option label="100" :value="100" />
              <el-option label="200" :value="200" />
              <el-option label="全部" :value="filteredScores.length" />
            </el-select>
          </div>
        </div>
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
                  <span class="chart-song-id">{{ chart.song_id }}</span>
                </div>
                
                <div class="chart-stats">
                  <div class="chart-achievement">
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
                      <span>{{ chart.dxScore }}/{{ getTotalDxScore(chart) }}</span>
                      <!-- 添加星级显示 -->
                      <div class="dx-stars" v-if="getTotalDxScore(chart)">
                        <star-icon v-for="(star, i) in getDxStars(chart)" :key="i" 
                           :size="14" 
                           :color="getStarColor(star)" 
                           class="dx-star-icon" />
                      </div>
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
        <div class="table-header">
          <h3>筛选结果 ({{ filteredScores.length }} 首)</h3>
          <!-- 每页数量选择 -->
          <div class="page-size-control">
            <span>每页显示：</span>
            <el-select v-model="pageSize" style="width: 80px;" size="small">
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
              <el-option label="100" :value="100" />
              <el-option label="200" :value="200" />
              <el-option label="全部" :value="filteredScores.length" />
            </el-select>
          </div>
        </div>
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
          <el-table-column prop="ds" label="定数" width="80">
            <template #default="scope">
              <span v-if="scope.row.ds">{{ parseFloat(scope.row.ds).toFixed(1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="achievements" label="达成率" width="100">
            <template #default="scope">
              <span style="color: #000000;">
                {{ formatAchievement(scope.row.achievements) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="fc" label="FC" width="80" />
          <el-table-column prop="fs" label="FS" width="80" />
          <el-table-column prop="dxScore" label="DX分数" width="120">
            <template #default="scope">
              <div v-if="scope.row.dxScore" class="table-dx-score">
                <span>{{ scope.row.dxScore }}/{{ getTotalDxScore(scope.row) }}</span>
                <div class="dx-stars-table" v-if="getTotalDxScore(scope.row)">
                  <star-icon v-for="(star, i) in getDxStars(scope.row)" :key="i" 
                     :size="12" 
                     :color="getStarColor(star)" 
                     class="dx-star-icon" />
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页控制 -->
      <div class="pagination-controls">
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredScores.length"
            :layout="paginationLayout"
            :small="isMobile"
          />
        </div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import html2canvas from 'html2canvas';
import musicDataService from '../utils/musicDataService';
import StarIcon from './icons/StarIcon.vue';

export default {
  name: 'AllScoresResult',
  components: {
    StarIcon
  },
  props: {
    allScoresData: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const searchText = ref('');
    const filterDifficulty = ref('all');
    const filterLevel = ref('all');
    const filterDs = ref('all');
    const filterGrade = ref('all');
    const sortBy = ref('achievement_desc');
    const currentPage = ref(1);
    const pageSize = ref(50);
    const displayMode = ref(true); // 默认为卡片视图
    const fallbackImages = ref({});
    const dxStarsData = ref({});
    const isMobile = ref(false);
    const allScoresContainer = ref(null);

    // 等级选项
    const levelOptions = ref([
      '1', '2', '3', '4', '5', '6', '7', '7+', 
      '8', '8+', '9', '9+', '10', '10+', 
      '11', '11+', '12', '12+', '13', '13+', 
      '14', '14+', '15'
    ]);

    // 检查设备类型
    const checkDeviceType = () => {
      isMobile.value = window.innerWidth < 768;
    };

    // 分页布局
    const paginationLayout = computed(() => {
      return isMobile.value ? 'prev, pager, next' : 'total, prev, pager, next, jumper';
    });

    // 根据定数获取对应的等级
    const getDsLevel = (ds) => {
      const dsValue = parseFloat(ds);
      if (isNaN(dsValue)) return null;
      
      const baseLevel = Math.floor(dsValue);
      const decimal = dsValue - baseLevel;
      
      if (decimal < 0.65) {
        return baseLevel.toString();
      } else {
        return baseLevel + '+';
      }
    };

    // 根据等级获取定数选项
    const availableDsOptions = computed(() => {
      if (filterLevel.value === 'all') return [];
      
      const level = filterLevel.value;
      const options = [];
      
      // 根据等级确定定数范围
      if (level.includes('+')) {
        const baseLevel = parseInt(level.replace('+', ''));
        const minDs = baseLevel + 0.7;
        const maxDs = baseLevel + 0.9;
        
        // 生成0.1间隔的定数选项
        for (let ds = minDs; ds <= maxDs; ds += 0.1) {
          const dsValue = Math.round(ds * 10) / 10;
          options.push({
            label: dsValue.toFixed(1),
            value: dsValue.toString()
          });
        }
      } else {
        const baseLevel = parseInt(level);
        const minDs = baseLevel;
        const maxDs = baseLevel + 0.6;
        
        // 生成0.1间隔的定数选项
        for (let ds = minDs; ds < maxDs; ds += 0.1) {
          const dsValue = Math.round(ds * 10) / 10;
          options.push({
            label: dsValue.toFixed(1),
            value: dsValue.toString()
          });
        }
      }
      
      return options;
    });

    // 等级变化处理
    const onLevelChange = () => {
      filterDs.value = 'all';
    };

    // 预加载星数据
    onMounted(async () => {
      checkDeviceType();
      window.addEventListener('resize', checkDeviceType);
      
      if (props.allScoresData && props.allScoresData.records) {
        await loadStarsData();
      }
    });

    // 监听数据变化，重新加载星数据
    watch(() => props.allScoresData, async (newData) => {
      if (newData && newData.records) {
        await loadStarsData();
      }
    });

    // 预加载所有星数数据
    const loadStarsData = async () => {
      if (!props.allScoresData?.records) return;
      
      for (const record of props.allScoresData.records) {
        const key = `${record.song_id}_${record.level_index}`;
        const totalDxScore = await musicDataService.getTotalDxScore(record.song_id, record.level_index);
        const stars = musicDataService.calculateDxStars(record.dxScore, totalDxScore);
        dxStarsData.value[key] = { totalDxScore, stars };
      }
    };

    // 获取总DX分数（同步）
    const getTotalDxScore = (chart) => {
      const key = `${chart.song_id}_${chart.level_index}`;
      return dxStarsData.value[key]?.totalDxScore || 0;
    };

    // 计算DX星级（同步）
    const getDxStars = (chart) => {
      const key = `${chart.song_id}_${chart.level_index}`;
      return dxStarsData.value[key]?.stars || [];
    };

    // 获取星星颜色
    const getStarColor = (starType) => {
      return musicDataService.getStarColor(starType);
    };

    // 重置筛选
    const resetFilters = () => {
      searchText.value = '';
      filterDifficulty.value = 'all';
      filterLevel.value = 'all';
      filterDs.value = 'all';
      filterGrade.value = 'all';
      sortBy.value = 'achievement_desc';
      currentPage.value = 1;
    };

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

    // 检查定数范围 - 更新为精确匹配
    const checkDsRange = (ds, targetDs) => {
      if (targetDs === 'all') return true;
      const dsValue = parseFloat(ds);
      const targetDsValue = parseFloat(targetDs);
      return Math.abs(dsValue - targetDsValue) < 0.05; // 允许小误差
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
      return classes[levelIndex] || 'basic';
    };

    // 评级样式类
    const getGradeClass = (achievement) => {
      const grade = getGrade(achievement);
      return `grade-${grade}`;
    };

    // 获取当前激活的筛选条件
    const getActiveFilters = () => {
      const filters = [];
      
      if (searchText.value) {
        filters.push(`搜索: ${searchText.value}`);
      }
      
      if (filterDifficulty.value !== 'all') {
        const difficultyNames = {
          '0': 'Basic',
          '1': 'Advanced',
          '2': 'Expert',
          '3': 'Master',
          '4': 'Re:Master'
        };
        filters.push(`难度: ${difficultyNames[filterDifficulty.value]}`);
      }
      
      if (filterLevel.value !== 'all') {
        filters.push(`等级: ${filterLevel.value}`);
      }
      
      if (filterDs.value !== 'all') {
        filters.push(`定数: ${filterDs.value}`);
      }
      
      if (filterGrade.value !== 'all') {
        const gradeNames = {
          'sssp': 'SSS+',
          'sss': 'SSS',
          'ssp': 'SS+',
          'ss': 'SS',
          'sp': 'S+',
          's': 'S',
          'aaa': 'AAA',
          'aa': 'AA',
          'a': 'A'
        };
        filters.push(`评级: ${gradeNames[filterGrade.value]}`);
      }
      
      return filters;
    };

    // 获取有效成绩数（过滤掉ID大于100000的歌曲）
    const getValidRecordsCount = () => {
      if (!props.allScoresData?.records) return 0;
      return props.allScoresData.records.filter(record => record.song_id <= 100000).length;
    };

    // 筛选后的分数数据
    const filteredScores = computed(() => {
      if (!props.allScoresData?.records) return [];
      
      let filtered = props.allScoresData.records.filter(record => {
        // 全局过滤：排除ID大于100000的歌曲
        if (record.song_id > 100000) return false;
        
        // 搜索过滤
        const matchSearch = !searchText.value || 
          (record.title && record.title.toLowerCase().includes(searchText.value.toLowerCase()));
        
        // 难度过滤
        const matchDifficulty = filterDifficulty.value === 'all' || 
          record.level_index === parseInt(filterDifficulty.value);
        
        // 等级过滤 - 基于定数计算等级
        const matchLevel = filterLevel.value === 'all' || 
          getDsLevel(record.ds) === filterLevel.value;
        
        // 定数过滤
        const matchDs = filterDs.value === 'all' || 
          checkDsRange(record.ds, filterDs.value);
        
        // 评级过滤
        const matchGrade = filterGrade.value === 'all' || 
          getGrade(record.achievements) === filterGrade.value;
        
        return matchSearch && matchDifficulty && matchLevel && matchDs && matchGrade;
      });

      // 排序
      if (sortBy.value === 'achievement_desc') {
        filtered.sort((a, b) => (b.achievements || 0) - (a.achievements || 0));
      } else if (sortBy.value === 'achievement_asc') {
        filtered.sort((a, b) => (a.achievements || 0) - (b.achievements || 0));
      } else if (sortBy.value === 'ds_desc') {
        filtered.sort((a, b) => (parseFloat(b.ds) || 0) - (parseFloat(a.ds) || 0));
      } else if (sortBy.value === 'ds_asc') {
        filtered.sort((a, b) => (parseFloat(a.ds) || 0) - (parseFloat(b.ds) || 0));
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
    watch([searchText, filterDifficulty, filterLevel, filterDs, filterGrade, sortBy], () => {
      currentPage.value = 1;
    });

    // 生成图片
    const generateImage = async () => {
      try {
        ElMessage.info('正在生成图片，请稍候...');
        
        // 添加打印模式样式类
        allScoresContainer.value.classList.add('print-mode');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const options = {
          useCORS: true,
          allowTaint: true,
          scale: 1,
          width: 1600,
          height: allScoresContainer.value.scrollHeight,
          backgroundColor: '#ffffff'
        };
        
        const canvas = await html2canvas(allScoresContainer.value, options);
        
        // 移除打印模式样式类
        allScoresContainer.value.classList.remove('print-mode');
        
        // 下载图片
        const link = document.createElement('a');
        link.download = `${props.allScoresData.nickname}_all_scores_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        ElMessage.success('图片生成成功');
      } catch (error) {
        console.error('生成图片失败:', error);
        allScoresContainer.value.classList.remove('print-mode');
        ElMessage.error('生成图片失败，请稍后再试');
      }
    };

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
      if (fallbackImages.value[songId]) {
        return fallbackImages.value[songId];
      }
      return musicDataService.getCoverUrl(songId);
    };

    // 处理图片加载错误
    const handleImageError = (event, songId) => {
      // 如果已经尝试过备用图片但仍失败，使用默认图片
      if (fallbackImages.value[songId]) {
        event.target.src = '/covers/0.png';
        return;
      }
      
      // 尝试使用备用图片
      const fallbackUrl = musicDataService.getFallbackCoverUrl(songId);
      fallbackImages.value[songId] = fallbackUrl;
      event.target.src = fallbackUrl;
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

    // 重写总成绩数获取方法，过滤掉ID大于100000的歌曲
    // 已在上方定义，删除此重复声明

    return {
      searchText,
      filterDifficulty,
      filterLevel,
      filterDs,
      filterGrade,
      sortBy,
      currentPage,
      pageSize,
      displayMode,
      levelOptions,
      availableDsOptions,
      filteredScores,
      paginatedScores,
      isMobile,
      paginationLayout,
      allScoresContainer,
      onLevelChange,
      resetFilters,
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
      getTotalDxScore,
      getDxStars,
      getStarColor,
      generateImage,
      exportData,
      exportFilteredData,
      getActiveFilters,
      getValidRecordsCount
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
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.scores-table {
  margin-bottom: 20px;
}

.table-dx-score {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.dx-stars-table {
  display: flex;
  align-items: center;
  gap: 1px;
}

.pagination-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center;
}

/* 按钮组对齐样式 */
.button-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 卡片和表格头部样式 */
.charts-header, .table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.charts-header h3, .table-header h3 {
  margin: 0;
  color: #333;
}

.table-header {
  margin-bottom: 15px;
}

/* 难度颜色 */
.difficulty-basic { color: #4CAF50; }
.difficulty-advanced { color: #FF9800; }
.difficulty-expert { color: #F44336; }
.difficulty-master { color: #9C27B0; }
.difficulty-remaster { color: #bb5cf1; }

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

.chart-song-id {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px 0 4px 0;
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

.dx-stars {
  display: flex;
  align-items: center;
  gap: 1px;
}

.dx-star-icon {
  margin-right: 1px;
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

/* 屏幕显示和打印显示控制 */
.screen-only {
  display: block;
}

.print-only-info {
  display: none;
}

.screen-only-info {
  display: block;
}

/* 打印模式样式 */
.print-mode {
  padding: 30px !important;
  margin: 0 !important;
  box-shadow: none !important;
  width: 1600px !important;
  border: none !important;
  background-color: white !important;
}

.print-mode .screen-only {
  display: none !important;
}

.print-mode .print-only-info {
  display: block !important;
}

.print-mode .screen-only-info {
  display: none !important;
}

.print-mode .user-info {
  background: transparent !important;
  color: #333333 !important;
  padding: 20px 0 !important;
  border-radius: 0 !important;
  margin-bottom: 30px !important;
  border-bottom: 2px solid #333333;
}

.print-mode .user-info h2 {
  font-size: 48px !important;
  margin-bottom: 20px !important;
  color: #333333 !important;
}

.print-mode .user-info p {
  font-size: 28px !important;
  margin: 8px 0 !important;
  color: #333333 !important;
}

.print-mode .charts-section h3 {
  font-size: 36px !important;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 15px;
  color: #333333;
  border-bottom: 1px solid #333333;
}

.print-mode .charts-grid {
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 10px !important;
  width: calc(1600px - 60px) !important;
}

.print-mode .chart-item {
  font-size: 14px !important;
  background-color: white !important;
  border: 1px solid #e0e0e0 !important;
}

.print-mode .chart-achievement {
  font-size: 32px !important;
  margin-top: -5px;
  margin-bottom: 2px;
}

.print-mode .chart-ds, 
.print-mode .chart-ra, 
.print-mode .chart-fc-green, 
.print-mode .chart-fc-orange, 
.print-mode .chart-fs-blue, 
.print-mode .chart-fs-green, 
.print-mode .chart-fs-orange {
    font-size: 16px !important;
    padding: 1px 4px !important;
  }
  
.print-mode .chart-dx-score {
  font-size: 16px;
  color: #606266;
}

.print-mode .chart-content {
  background-color: white !important;
}

.print-mode .chart-details span {
  background-color: #f5f5f5 !important;
}

.print-mode .pagination,
.print-mode .search-filters,
.print-mode .actions {
  display: none !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .all-scores-result {
    margin: 5px;
    padding: 10px;
    width: calc(100% - 10px);
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-row .el-input,
  .filter-row .el-select {
    width: 100% !important;
  }
  
  .button-group {
    justify-content: center;
    gap: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* 移动端卡片布局优化 */
  .charts-grid {
    grid-template-columns: 1fr !important;
    gap: 15px;
    width: 100%;
  }
  
  .chart-item {
    width: 100%;
    max-width: none;
  }
  
  .chart-cover {
    width: 80px !important;
    height: 80px !important;
  }
  
  .chart-row {
    gap: 10px;
  }
  
  .chart-stats {
    margin-left: 10px;
    flex: 1;
  }
  
  .chart-achievement {
    font-size: 16px !important;
  }
  
  .chart-details {
    gap: 6px;
  }
  
  .chart-ds, .chart-ra, 
  .chart-fc-green, .chart-fc-orange,
  .chart-fs-blue, .chart-fs-green, .chart-fs-orange {
    font-size: 11px !important;
    padding: 1px 4px !important;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .pagination {
    overflow-x: auto;
    justify-content: flex-start;
  }
}
</style>