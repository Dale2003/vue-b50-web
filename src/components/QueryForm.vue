<template>
  <div class="query-form">
    <div class="data-source-info">数据来源: <a href="https://www.diving-fish.com/maimaidx/prober/" target="_blank">diving-fish</a></div>
    <el-form :model="form" label-width="80px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="QQ号查询b50" name="qq">
          <el-form-item label="QQ号">
            <el-input v-model="form.qq" placeholder="请输入QQ号"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="用户名查询b50" name="username">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="查询全部分数（测试）" name="allScores">
          <el-form-item label="QQ号">
            <el-input v-model="form.testQQ" placeholder="请输入QQ号"></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.testUsername" placeholder="请输入用户名（可选）"></el-input>
          </el-form-item>
          <div class="test-warning">
            <el-alert
              title="测试功能说明"
              type="warning"
              description="此功能为测试版，将显示用户的全部游戏分数记录。数据量可能较大，请耐心等待。"
              show-icon
              :closable="false"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <el-form-item label="显示模式">
        <el-radio-group v-model="form.displayMode">
          <el-radio label="b50">B50图表</el-radio>
          <el-radio label="raw">原始JSON数据</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="queryData" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 原始JSON数据展示区域 -->
    <div v-if="rawData && form.displayMode === 'raw'" class="raw-data">
      <h3>原始API返回数据</h3>
      <el-button size="small" @click="copyRawData">复制JSON</el-button>
      <pre class="json-viewer">{{ JSON.stringify(rawData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { fetchB50Data, getAllScoresData } from '../api/b50';
import { UserInfo } from '../types';

export default {
  name: 'QueryForm',
  emits: ['dataLoaded'],
  setup(props, { emit }) {
    const activeTab = ref('qq');
    const loading = ref(false);
    const error = ref('');
    const rawData = ref(null);
    
    const form = reactive({
      qq: '',
      username: '',
      displayMode: 'b50',
      testQQ: '',
      testUsername: ''
    });

    const fetchRawData = async (qq, username) => {
      try {
        let params = { b50: true };
        
        if (qq) {
          params.qq = qq;
        } else if (username) {
          params.username = username;
        } else {
          throw new Error('需要提供QQ号或用户名');
        }
        
        const response = await axios.post('https://www.diving-fish.com/api/maimaidxprober/query/player', params);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 400) {
          throw new Error('找不到此用户，请重试');
        } else if (error.response && error.response.status === 404) {
          throw new Error('找不到此用户，请重试');
        }
        throw error;
      }
    };

    const queryData = async () => {
      try {
        error.value = '';
        loading.value = true;
        
        // 根据不同的选项卡获取不同的查询参数
        let qq = null;
        let username = null;
        
        if (activeTab.value === 'qq') {
          qq = form.qq;
        } else if (activeTab.value === 'username') {
          username = form.username;
        } else if (activeTab.value === 'allScores') {
          qq = form.testQQ;
          username = form.testUsername;
        }
        
        if (!qq && !username) {
          error.value = '请输入QQ号或用户名';
          return;
        }
        
        // 如果是测试版全部分数查询
        if (activeTab.value === 'allScores') {
          const allScoresData = await getAllScoresData(qq, username);
          emit('dataLoaded', allScoresData, 'allScores');
          return;
        }
        
        // 获取原始数据（仅用于显示）
        if (form.displayMode === 'raw') {
          rawData.value = await fetchRawData(qq, username);
          emit('dataLoaded', null, 'raw');
          return;
        }
        
        // 获取B50数据
        const userData = await fetchB50Data(qq, username);
        
        // 发送数据到父组件
        emit('dataLoaded', userData, 'b50');
        
      } catch (err) {
        console.error('查询失败:', err);
        error.value = err.message || '查询失败，请稍后再试';
      } finally {
        loading.value = false;
      }
    };
    
    const copyRawData = () => {
      if (!rawData.value) return;
      
      const jsonString = JSON.stringify(rawData.value, null, 2);
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          ElMessage.success('JSON数据已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          ElMessage.error('复制失败，请手动复制');
        });
    };

    return {
      activeTab,
      form,
      loading,
      error,
      rawData,
      queryData,
      copyRawData
    };
  }
};
</script>

<style scoped>
.query-form {
  background-color: white;
  /* max-width: 800px; */
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%; /* 响应式宽度 */
  max-width: 1200px; /* 最大宽度限制 */
  box-sizing: border-box;
}

/* 移动端样式调整 */
@media (max-width: 767px) {
  .query-form {
    margin: 10px;
    padding: 15px;
    width: calc(100% - 20px);
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .el-input {
    width: 100%;
  }
  
  .el-button {
    width: 100%;
    margin-top: 10px;
  }
}

/* 平板样式调整 */
@media (min-width: 768px) and (max-width: 1024px) {
  .query-form {
    margin: 15px auto;
    padding: 20px;
    max-width: 90%;
  }
}

/* 桌面端样式调整 */
@media (min-width: 1025px) {
  .query-form {
    margin: 20px auto;
    padding: 25px;
    max-width: 800px;
  }
}

.data-source-info {
  text-align: center;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.data-source-info a {
  color: #409EFF;
  text-decoration: none;
}

.data-source-info a:hover {
  text-decoration: underline;
}

.error-message {
  color: #F56C6C;
  margin-top: 15px;
  padding: 10px;
  background-color: #FEF0F0;
  border-radius: 4px;
}

.raw-data {
  margin-top: 20px;
  border-top: 1px solid #EBEEF5;
  padding-top: 20px;
}

.raw-data h3 {
  margin-bottom: 10px;
}

.json-viewer {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  /* max-height: 600px; */
  overflow-y: auto;
  white-space: pre-wrap;
  margin-top: 10px;
}

.test-warning {
  margin-top: 10px;
}
</style>