module.exports = {
    publicPath: './',
    // 输出文件目录
    outputDir: 'dist',
    // webpack-dev-server 相关配置
    devServer: {
      
    },//webpack配置
    lintOnSave:false,   //配置关闭eslint
    configureWebpack: {   
        //警告 webpack 的性能提示
        performance: {
          hints:'warning',
          //入口起点的最大体积
          maxEntrypointSize: 5000000000,
          //生成文件的最大体积
          maxAssetSize: 3000000000,
          //只给出 js 文件的性能提示
          assetFilter: function(assetFilename) {
            return assetFilename.endsWith('.js');
          }
        }
      }
  }