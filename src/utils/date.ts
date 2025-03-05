/**
 * 日期格式化函数
 * @param date 日期对象
 * @param fmt 格式化字符串
 * @returns 格式化后的日期字符串
 * 
 * 使用方法:
 * formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss') => 2023-10-18 14:30:45
 * formatDate(new Date(), 'yyyy年MM月dd日') => 2023年10月18日
 */
export function formatDate(date: Date, fmt: string): string {
  if (!date) return '';
  
  const o: Record<string, number> = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1, 
        RegExp.$1.length === 1 
          ? o[k].toString() 
          : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  
  return fmt;
}

/**
 * 获取日期范围的开始和结束时间
 * @param type 范围类型: today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth
 * @returns 开始和结束日期时间对象
 */
export function getDateRange(type: string): { start: Date, end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'thisWeek': {
      const day = start.getDay() || 7; // 当前是周几，周日为0转为7
      start.setDate(start.getDate() - day + 1); // 设置为本周一
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
      
    case 'lastWeek': {
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day - 6); // 上周一
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - day); // 上周日
      end.setHours(23, 59, 59, 999);
      break;
    }
      
    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'lastMonth': {
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      start.setFullYear(year, month, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(year, month + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
      
    default:
      break;
  }
  
  return { start, end };
} 