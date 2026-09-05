// 后端（Node/Express）独立的 ESLint 配置
// root:true 阻断向上继承前端 .eslintrc.cjs（那里 env 是 browser，会把 process 判为未定义）
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    // Express 错误处理中间件签名必须保留 4 个参数 (err,req,res,next)，
    // 用不到的 next 以 _ 前缀命名即可避免 no-unused-vars 报错
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules', 'dev.db', 'install.log', '.env'],
}
