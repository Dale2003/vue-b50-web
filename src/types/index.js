// 定义图表信息类型，对应Python中的ChartInfo
export class ChartInfo {
  constructor(data = {}) {
    this.achievements = data.achievements || 0;
    this.ds = data.ds || 0;
    this.dxScore = data.dxScore || 0;
    this.fc = data.fc || '';
    this.fs = data.fs || '';
    this.level = data.level || '';
    this.level_index = data.level_index || 0;
    this.level_label = data.level_label || '';
    this.ra = data.ra || 0;
    this.rate = data.rate || '';
    this.song_id = data.song_id || 0;
    this.title = data.title || '';
    this.type = data.type || '';
  }
}

// 定义数据类型，对应Python中的Data
export class Data {
  constructor(data = {}) {
    this.sd = (data.sd || []).map(chart => new ChartInfo(chart));
    this.dx = (data.dx || []).map(chart => new ChartInfo(chart));
  }
}

// 定义用户信息类型，对应Python中的UserInfo
export class UserInfo {
  constructor(data = {}) {
    this.additional_rating = data.additional_rating || 0;
    this.charts = new Data(data.charts || {});
    this.nickname = data.nickname || '';
    this.plate = data.plate || '';
    this.rating = data.rating || 0;
    this.username = data.username || '';
  }
}

// 常量定义
export const scoreRank = ['d', 'c', 'b', 'bb', 'bbb', 'a', 'aa', 'aaa', 's', 's+', 'ss', 'ss+', 'sss', 'sss+'];
export const scoreRankMap = {
  'd': 'D', 'c': 'C', 'b': 'B', 'bb': 'BB', 'bbb': 'BBB', 
  'a': 'A', 'aa': 'AA', 'aaa': 'AAA', 's': 'S', 'sp': 'Sp', 
  'ss': 'SS', 'ssp': 'SSp', 'sss': 'SSS', 'sssp': 'SSSp'
};
export const comboRank = ['fc', 'fc+', 'ap', 'ap+'];
export const comboRankMap = {'fc': 'FC', 'fcp': 'FCp', 'ap': 'AP', 'app': 'APp'};
export const syncRank = ['fs', 'fs+', 'fdx', 'fdx+'];
export const syncRankMap = {
  'fs': 'FS', 'fsp': 'FSp', 'fsd': 'FSD', 'fsdp': 'FSDp',
  'sync': 'SYNC', 'fdx': 'FSD', 'fdxp': 'FSDp'
};
export const diffs = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master'];
export const levelList = ['1', '2', '3', '4', '5', '6', '7', '7+', '8', '8+', '9', '9+', '10', '10+', '11', '11+', '12', '12+', '13', '13+', '14', '14+', '15'];
export const achievementList = [50.0, 60.0, 70.0, 75.0, 80.0, 90.0, 94.0, 97.0, 98.0, 99.0, 99.5, 100.0, 100.5];
export const baseRaSpp = [7.0, 8.0, 9.6, 11.2, 12.0, 13.6, 15.2, 16.8, 20.0, 20.3, 20.8, 21.1, 21.6, 22.4];