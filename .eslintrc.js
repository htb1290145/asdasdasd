module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  parserOptions: {
    parser: '@babel/eslint-parser',
    // 文件第一行红色下标报错解决
    requireConfigFile: false
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 函数与变量之间没有空格
    'space-before-function-paren': 0,
    'vue/multi-word-component-names': 1,
    'vue/no-unused-vars': 0
    // 'vue/no-unused-components': 'off'
  }
}
