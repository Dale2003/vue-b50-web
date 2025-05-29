import axios from 'axios';
import { UserInfo, ChartInfo, Data } from '../types';

// 配置基础的API URL
const API_BASE_URL = 'https://www.diving-fish.com/api/maimaidxprober';

/**
 * 获取玩家的B50数据
 * @param {string|number} qq - 玩家QQ号
 * @param {string} username - 玩家用户名
 * @returns {Promise<UserInfo>} 玩家B50数据
 */
export async function fetchB50Data(qq = null, username = null) {
  try {
    let params = { b50: true };
    
    if (qq) {
      params.qq = qq;
    } else if (username) {
      params.username = username;
    } else {
      throw new Error('需要提供QQ号或用户名');
    }
    
    const response = await axios.post(`${API_BASE_URL}/query/player`, params);
    return new UserInfo(response.data);
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      throw new Error('找不到此用户，请重试');
    }
    throw error;
  }
}

/**
 * 获取玩家的详细成绩列表
 * @param {string|number} qq - 玩家QQ号
 * @param {string} username - 玩家用户名
 * @returns {Promise<Object>} 玩家详细成绩数据
 */
export async function getScoreListDev(qq = null, username = null, developerToken = '') {
  try {
    let params = {};
    
    if (qq) {
      params.qq = qq;
    } else if (username) {
      params.username = username;
    } else {
      throw new Error('需要提供QQ号或用户名');
    }
    
    // 设置开发者token
    const headers = { 'developer-token': developerToken };
    
    const response = await axios.get(`${API_BASE_URL}/dev/player/records`, { 
      headers, 
      params 
    });
    
    return response.data;
  } catch (error) {
    console.error('获取玩家详细成绩失败:', error);
    throw error;
  }
}

/**
 * 计算单曲Rating值（当前版本）
 * @param {number} ds - 谱面定数
 * @param {number} achievement - 达成率
 * @returns {number} 计算后的Rating值
 */
export function computeRa(ds, achievement) {
  let baseRa;
  let rate;
  
  if (achievement < 50) {
    baseRa = 7.0;
    rate = 'd';
  } else if (achievement < 60) {
    baseRa = 8.0;
    rate = 'c';
  } else if (achievement < 70) {
    baseRa = 9.6;
    rate = 'b';
  } else if (achievement < 75) {
    baseRa = 11.2;
    rate = 'bb';
  } else if (achievement < 80) {
    baseRa = 12.0;
    rate = 'bbb';
  } else if (achievement < 90) {
    baseRa = 13.6;
    rate = 'a';
  } else if (achievement < 94) {
    baseRa = 15.2;
    rate = 'aa';
  } else if (achievement < 97) {
    baseRa = 16.8;
    rate = 'aaa';
  } else if (achievement < 98) {
    baseRa = 20.0;
    rate = 's';
  } else if (achievement < 99) {
    baseRa = 20.3;
    rate = 'sp';
  } else if (achievement < 99.5) {
    baseRa = 20.8;
    rate = 'ss';
  } else if (achievement < 100) {
    baseRa = 21.1;
    rate = 'ssp';
  } else if (achievement < 100.5) {
    baseRa = 21.6;
    rate = 'sss';
  } else {
    baseRa = 22.4;
    rate = 'sssp';
  }
  
  return Math.floor(ds * (Math.min(100.5, achievement) / 100) * baseRa);
}

/**
 * 计算旧版本Rating值（2021/2022）
 * @param {number} ds - 谱面定数
 * @param {number} achievement - 达成率
 * @param {boolean} isRate - 是否返回等级
 * @returns {number|Object} 计算后的Rating值或{rating, rate}对象
 */
export function computeRaOld(ds, achievement, isRate = false) {
  let baseRa;
  let rate;
  
  if (achievement < 50) {
    baseRa = 4.0;
    rate = 'd';
  } else if (achievement < 60) {
    baseRa = 5.0;
    rate = 'c';
  } else if (achievement < 70) {
    baseRa = 6.0;
    rate = 'b';
  } else if (achievement < 75) {
    baseRa = 7.0;
    rate = 'bb';
  } else if (achievement < 80) {
    baseRa = 7.5;
    rate = 'bbb';
  } else if (achievement < 90) {
    baseRa = 8.5;
    rate = 'a';
  } else if (achievement < 94) {
    baseRa = 9.5;
    rate = 'aa';
  } else if (achievement < 97) {
    baseRa = 10.5;
    rate = 'aaa';
  } else if (achievement < 98) {
    baseRa = 12.5;
    rate = 's';
  } else if (achievement < 99) {
    baseRa = 12.7;
    rate = 'sp';
  } else if (achievement < 99.5) {
    baseRa = 13.0;
    rate = 'ss';
  } else if (achievement < 100) {
    baseRa = 13.2;
    rate = 'ssp';
  } else if (achievement < 100.5) {
    baseRa = 13.5;
    rate = 'sss';
  } else {
    baseRa = 14.0;
    rate = 'sssp';
  }
  
  const value = Math.floor(ds * (Math.min(100.5, achievement) / 100) * baseRa);
  
  if (isRate) {
    return { rating: value, rate };
  }
  
  return value;
}

/**
 * 计算更旧版本Rating值（2020）
 * @param {number} ds - 谱面定数
 * @param {number} achievement - 达成率
 * @param {boolean} isRate - 是否返回等级
 * @returns {number|Object} 计算后的Rating值或{rating, rate}对象
 */
export function computeRaOldOld(ds, achievement, isRate = false) {
  let baseRa;
  let rate;
  
  if (achievement < 50) {
    baseRa = 4.0;
    rate = 'd';
  } else if (achievement < 60) {
    baseRa = 5.0;
    rate = 'c';
  } else if (achievement < 70) {
    baseRa = 6.0;
    rate = 'b';
  } else if (achievement < 75) {
    baseRa = 7.0;
    rate = 'bb';
  } else if (achievement < 80) {
    baseRa = 7.5;
    rate = 'bbb';
  } else if (achievement < 90) {
    baseRa = 8.5;
    rate = 'a';
  } else if (achievement < 94) {
    baseRa = 9.0;
    rate = 'aa';
  } else if (achievement < 97) {
    baseRa = 9.4;
    rate = 'aaa';
  } else if (achievement < 98) {
    baseRa = 10.0;
    rate = 's';
  } else if (achievement < 99) {
    baseRa = 11.0;
    rate = 'sp';
  } else if (achievement < 99.5) {
    baseRa = 12.0;
    rate = 'ss';
  } else if (achievement < 100) {
    baseRa = 13.0;
    rate = 'ssp';
  } else if (achievement < 100.5) {
    baseRa = 14.0;
    rate = 'sss';
  } else {
    baseRa = 15.0;
    rate = 'sssp';
  }
  
  const value = Math.floor(ds * (Math.min(100.5, achievement) / 100) * baseRa);
  
  if (isRate) {
    return { rating: value, rate };
  }
  
  return value;
}

/**
 * 获取2023版本B50数据
 * @param {string|number} qq - 玩家QQ号
 * @param {string} username - 玩家用户名
 * @param {Array} musicData2023 - 2023版本音乐数据
 * @returns {Promise<UserInfo>} 玩家2023版本B50数据
 */
export async function fetch2023B50Data(qq = null, username = null, musicData2023, developerToken = '') {
  try {
    const data = await getScoreListDev(qq, username, developerToken);
    const dataRecords = data.records;
    const b35Records = [];
    const b15Records = [];
    
    for (const record of dataRecords) {
      for (const music of musicData2023) {
        if (parseInt(music.id) === parseInt(record.song_id)) {
          try {
            record.ds = music.ds[record.level_index];
            record.ra = computeRa(parseFloat(record.ds), parseFloat(record.achievements));
            
            if (!music.basic_info.is_new) {
              b35Records.push(record);
            } else {
              b15Records.push(record);
            }
          } catch (e) {
            console.error('处理记录出错:', e);
          }
        }
      }
    }
    
    // 按ra降序排序并获取前35和前15的记录
    const top35 = b35Records.sort((a, b) => b.ra - a.ra).slice(0, 35);
    const top15 = b15Records.sort((a, b) => b.ra - a.ra).slice(0, 15);
    
    // 计算总rating
    const rating = top35.reduce((sum, record) => sum + record.ra, 0) + 
                   top15.reduce((sum, record) => sum + record.ra, 0);
    
    // 构建UserInfo对象
    const userInfo = new UserInfo({
      additional_rating: data.additional_rating,
      charts: {
        sd: top35,
        dx: top15
      },
      nickname: data.nickname,
      plate: data.plate,
      rating: rating,
      username: data.username
    });
    
    return userInfo;
  } catch (error) {
    console.error('获取2023版本B50数据失败:', error);
    throw error;
  }
}

/**
 * 获取2025版本B50数据
 * @param {string|number} qq - 玩家QQ号
 * @param {string} username - 玩家用户名
 * @param {Object} musicData2025 - 2025版本音乐数据
 * @param {boolean} isB35 - 是否为B35模式
 * @returns {Promise<UserInfo>} 玩家2025版本B50数据
 */
export async function fetch2025B50Data(qq = null, username = null, musicData2025, isB35 = false, developerToken = '') {
  try {
    const data = await getScoreListDev(qq, username, developerToken);
    const dataRecords = data.records;
    const allRecords = [];
    
    for (const record of dataRecords) {
      const musicId = record.song_id.toString();
      if (musicData2025[musicId]) {
        try {
          const music = musicData2025[musicId];
          record.ds = music.notes[record.level_index].lv;
          record.ra = computeRa(parseFloat(record.ds), parseFloat(record.achievements));
          allRecords.push(record);
        } catch (e) {
          console.error('处理记录出错:', e);
        }
      }
    }
    
    // 按ra降序排序
    const sortedRecords = allRecords.sort((a, b) => b.ra - a.ra);
    
    // 根据模式选择前35或前50条记录
    const topRecords = isB35 ? sortedRecords.slice(0, 35) : sortedRecords.slice(0, 50);
    
    // 计算总rating
    const rating = topRecords.reduce((sum, record) => sum + record.ra, 0);
    
    // 构建UserInfo对象
    const userInfo = new UserInfo({
      additional_rating: data.additional_rating,
      charts: {
        sd: topRecords,
        dx: []
      },
      nickname: data.nickname,
      plate: data.plate,
      rating: rating,
      username: data.username
    });
    
    return userInfo;
  } catch (error) {
    console.error('获取2025版本B50数据失败:', error);
    throw error;
  }
}

/**
 * 获取旧版本(2020/2021/2022)B50数据
 * @param {string|number} qq - 玩家QQ号
 * @param {string} username - 玩家用户名
 * @param {number} year - 年份(2020/2021/2022)
 * @param {Array} musicData - 对应年份的音乐数据
 * @param {boolean} ifb40 - 是否为B40模式
 * @returns {Promise<UserInfo>} 玩家旧版本B50数据
 */
export async function fetchOldB50Data(qq = null, username = null, year, musicData, ifb40 = false, developerToken = '') {
  try {
    const data = await getScoreListDev(qq, username, developerToken);
    const dataRecords = data.records;
    const b35Records = [];
    const b15Records = [];
    
    for (const record of dataRecords) {
      for (const music of musicData) {
        if (parseInt(music.id) === parseInt(record.song_id)) {
          try {
            record.ds = music.ds[record.level_index];
            
            // 根据年份选择不同的计算函数
            if (year === 2020) {
              record.ra = computeRaOldOld(parseFloat(record.ds), parseFloat(record.achievements));
            } else {
              record.ra = ifb40 ? 
                computeRaOld(parseFloat(record.ds), parseFloat(record.achievements)) : 
                computeRa(parseFloat(record.ds), parseFloat(record.achievements));
            }
            
            if (!music.basic_info.is_new) {
              b35Records.push(record);
            } else {
              b15Records.push(record);
            }
          } catch (e) {
            console.error('处理记录出错:', e);
          }
        }
      }
    }
    
    // 根据B40模式或B50模式选择不同数量的记录
    const topOldRecords = ifb40 ? 
      b35Records.sort((a, b) => b.ra - a.ra).slice(0, 25) : 
      b35Records.sort((a, b) => b.ra - a.ra).slice(0, 35);
    
    const topNewRecords = b15Records.sort((a, b) => b.ra - a.ra).slice(0, 15);
    
    // 计算总rating
    const rating = ifb40 ? 
      data.rating : 
      topOldRecords.reduce((sum, record) => sum + record.ra, 0) + 
      topNewRecords.reduce((sum, record) => sum + record.ra, 0);
    
    // 构建UserInfo对象
    const userInfo = new UserInfo({
      additional_rating: data.additional_rating,
      charts: {
        sd: topOldRecords,
        dx: topNewRecords
      },
      nickname: data.nickname,
      plate: data.plate,
      rating: rating,
      username: data.username
    });
    
    return userInfo;
  } catch (error) {
    console.error(`获取${year}版本B50数据失败:`, error);
    throw error;
  }
}