const webpack =  require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const fs = require('fs');

const devWebpackConfig = merge(baseWebpackConfig, {
  // DEV config
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: baseWebpackConfig.externals.paths.dist,
    port: 7071,
    host: '0.0.0.0',
		open: false,
    overlay: {
      warnings: true,
      errors: true
    },
		setup(app){
      var bodyParser = require('body-parser');    
      app.use(bodyParser.urlencoded({extended : true}));
      app.use(bodyParser.json());

      app.post('/api/cart', (req, res) => {
          
          if(req.body.action == 'get_order'){
            const data = fs.readFileSync('./src/static/api/cart/get_order.json', 'utf8')
            res.send(data)
          }

          
      }); 
      
      app.post('/api/search', (req, res) => {
          const data = fs.readFileSync('./src/static/api/search.json', 'utf8')
          res.send(data)
      });

  

    }
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    })
  ]
})

module.exports = new Promise((resolve, reject) => {
  resolve(devWebpackConfig)
})
