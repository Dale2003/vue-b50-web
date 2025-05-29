/**
 * 音乐数据加载工具
 * 用于加载和管理不同版本的舞萌DX音乐数据
 */

import axios from 'axios';

class MusicDataService {
  constructor() {
    this.musicData = null;        // 最新版本数据
    this.musicData2023 = null;    // 2023版本数据
    this.musicData2022 = null;    // 2022版本数据
    this.musicData2021 = null;    // 2021版本数据
    this.musicData2020 = null;    // 2020版本数据
    this.musicData2025 = null;    // 2025版本数据
  }

  /**
   * 加载最新版本的音乐数据
   * @returns {Promise<Array>} 音乐数据
   */
  async loadLatestMusicData() {
    if (this.musicData) {
      return this.musicData;
    }

    try {
      const response = await axios.get('/json/music_data.json');
      this.musicData = response.data;
      return this.musicData;
    } catch (error) {
      console.error('加载最新音乐数据失败:', error);
      throw error;
    }
  }

  /**
   * 加载2023版本的音乐数据
   * @returns {Promise<Array>} 2023版本音乐数据
   */
  async load2023MusicData() {
    if (this.musicData2023) {
      return this.musicData2023;
    }

    try {
      const response = await axios.get('/json/MusicData_2023.json');
      this.musicData2023 = response.data;
      return this.musicData2023;
    } catch (error) {
      console.error('加载2023版本音乐数据失败:', error);
      throw error;
    }
  }

  /**
   * 加载2025版本的音乐数据
   * @returns {Promise<Object>} 2025版本音乐数据
   */
  async load2025MusicData() {
    if (this.musicData2025) {
      return this.musicData2025;
    }

    try {
      const response = await axios.get('/json/MusicData_2025.json');
      this.musicData2025 = response.data;
      return this.musicData2025;
    } catch (error) {
      console.error('加载2025版本音乐数据失败:', error);
      throw error;
    }
  }

  /**
   * 加载特定年份的音乐数据
   * @param {number} year - 年份 (2020, 2021, 2022)
   * @returns {Promise<Array>} 特定年份的音乐数据
   */
  async loadMusicDataByYear(year) {
    switch (year) {
      case 2020:
        if (this.musicData2020) {
          return this.musicData2020;
        }
        try {
          const response = await axios.get('/json/maidxCN_20000.json');
          this.musicData2020 = response.data;
          // 处理数据格式
          this.processMusicType(this.musicData2020);
          return this.musicData2020;
        } catch (error) {
          console.error('加载2020版本音乐数据失败:', error);
          throw error;
        }

      case 2021:
        if (this.musicData2021) {
          return this.musicData2021;
        }
        try {
          const response = await axios.get('/json/maidxCN_21000.json');
          this.musicData2021 = response.data;
          // 处理数据格式
          this.processMusicType(this.musicData2021);
          return this.musicData2021;
        } catch (error) {
          console.error('加载2021版本音乐数据失败:', error);
          throw error;
        }

      case 2022:
        if (this.musicData2022) {
          return this.musicData2022;
        }
        try {
          const response = await axios.get('/json/maidxCN_22000.json');
          this.musicData2022 = response.data;
          // 处理数据格式
          this.processMusicType(this.musicData2022);
          return this.musicData2022;
        } catch (error) {
          console.error('加载2022版本音乐数据失败:', error);
          throw error;
        }

      default:
        throw new Error(`不支持的年份: ${year}`);
    }
  }

  /**
   * 处理歌曲类型，统一格式
   * @param {Array} musicData - 需要处理的音乐数据
   */
  processMusicType(musicData) {
    for (const music of musicData) {
      if (music.type === '标准') {
        music.type = 'SD';
      }
      
      if (music.basic_info && music.basic_info.from === '舞萌DX') {
        music.basic_info.is_new = true;
      } else if (music.basic_info && music.basic_info.from === '舞萌DX 2021') {
        music.basic_info.is_new = true;
      } else if (music.basic_info && music.basic_info.from === '舞萌DX 2022') {
        music.basic_info.is_new = true;
      } else if (music.basic_info) {
        music.basic_info.is_new = false;
      }
    }
    
    return musicData;
  }

  /**
   * 获取歌曲封面URL
   * @param {number} songId - 歌曲ID
   * @returns {string} 封面图片URL
   */
  getCoverUrl(songId) {
    return `/covers/${songId}.png`;
  }

  /**
   * 获取备用歌曲封面URL
   * @param {number} songId - 歌曲ID
   * @returns {string} 备用封面图片URL
   */
  getFallbackCoverUrl(songId) {
    if (parseInt(songId) < 10000) {
      return `/covers/${parseInt(songId) + 10000}.png`;
    } else {
      return `/covers/${parseInt(songId) - 10000}.png`;
    }
  }

  /**
   * 获取歌曲的总DX分数（参考origin.py计算方式）
   * @param {number} songId - 歌曲ID
   * @param {number} levelIndex - 难度索引
   * @param {boolean} is2023 - 是否为2023版本数据
   * @returns {number} 总DX分数
   */
  async getTotalDxScore(songId, levelIndex, is2023 = false) {
    try {
      // 直接使用最新版本数据
      await this.loadLatestMusicData();
      for (const music of this.musicData) {
        if (parseInt(music.id) === parseInt(songId)) {
          const chartData = music.charts;
          if (chartData && chartData[levelIndex] && chartData[levelIndex].notes) {
            const notes = chartData[levelIndex].notes;
            return this.sumArray(notes) * 3;
          }
        }
      }
      
      return 0;
    } catch (error) {
      console.error('获取总DX分数失败:', error);
      return 0;
    }
  }

  /**
   * 计算DX星级（参考origin.py的dxScore方法）
   * @param {number} dxScore - 当前DX分数
   * @param {number} totalDxScore - 总DX分数
   * @returns {Array} 星星数组，每个元素表示星星类型 (0=一星, 1=二星, 2=三星)
   */
  calculateDxStars(dxScore, totalDxScore) {
    if (!totalDxScore) return [];
    
    const dxPercentage = (dxScore / totalDxScore) * 100;
    
    // 根据origin.py的dxScore方法实现星级计算
    if (dxPercentage <= 85) {
      return []; // 无星星
    } else if (dxPercentage <= 90) {
      return [0]; // 1颗一星
    } else if (dxPercentage <= 93) {
      return [0, 0]; // 2颗一星
    } else if (dxPercentage <= 95) {
      return [1, 1, 1]; // 3颗二星
    } else if (dxPercentage <= 97) {
      return [1, 1, 1, 1]; // 4颗二星
    } else {
      return [2, 2, 2, 2, 2]; // 5颗三星
    }
  }

  /**
   * 获取星星颜色
   * @param {number} starType - 星星类型 (0=一星, 1=二星, 2=三星)
   * @returns {string} 颜色值
   */
  getStarColor(starType) {
    const colors = ['#00C851', '#FF6900', '#FFD700']; // 绿色(一星)，橙红色(二星)，黄色(三星)
    return colors[starType] || colors[0];
  }

  /**
   * 数组求和辅助函数
   * @param {Array} array - 数组
   * @returns {number} 数组元素的总和
   */
  sumArray(array) {
    return array.reduce((total, current) => total + current, 0);
  }
}

// 创建单例实例
const musicDataService = new MusicDataService();

export default musicDataService;