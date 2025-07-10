import * as dotenv from 'dotenv';
// 加载.env.local文件的环境变量
dotenv.config({ path: '.env.local' });

import { createClient } from './supabase/client';

// 打印环境变量(不包含实际值，只检查是否存在)
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log('尝试连接 Supabase...');
const supabase = createClient();

async function testConnection() {
  try {
    console.log('执行查询...');
    const { data, error } = await supabase.from('customers').select('*').limit(5);

    if (error) {
      console.error('连接 Supabase 时出错:', error);
    } else {
      console.log('从 Supabase 获取的数据:', data);
      console.log('连接成功!');
    }
  } catch (e) {
    console.error('执行查询时发生异常:', e);
  }
}

testConnection()
  .catch(err => console.error('测试连接时发生错误:', err));