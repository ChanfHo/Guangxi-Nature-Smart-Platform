// 引入pg模块
const { Client } = require('pg');

// 配置数据库连接
const client = new Client({
  host: '140.143.194.176',         // 数据库服务器地址
  port: 5432,                // PostgreSQL 默认端口
  user: 'postgres',      // 替换为你的用户名
  password: 'Jishe123',  // 替换为你的密码
  database: 'my_db',  // 替换为你的数据库名称
});

// 连接数据库
client.connect()
  .then(() => {
    console.log('Connected to the database');

    // 执行 PostGIS 查询，例如，查询某个地理数据表
    return client.query('SELECT * FROM '); // 替换为你的表名
  })
  .then(res => {
    console.log('Query result:', res.rows); // 输出查询结果
  })
  .catch(err => {
    console.error('Error executing query', err.stack);
  })
  .finally(() => {
    client.end(); // 断开连接
  });
