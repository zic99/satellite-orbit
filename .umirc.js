
// ref: https://umijs.org/config/
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const path = require('path');

export default {
    copy: [

        { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },

        { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },

        { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },

    ],
    treeShaking: true,

    routes: [
        {
            path: '/',
            component: '../pages/index.jsx',
      
        },
    ],
    plugins: [
        // ref: https://umijs.org/plugin/umi-plugin-react.html
        ['umi-plugin-react', {
            antd: true,
            dva: true,
            dynamicImport: { webpackChunkName: true },
            title: 'test',
            dll: false,

            routes: {
                exclude: [
                    /models\//,
                    /services\//,
                    /model\.(t|j)sx?$/,
                    /service\.(t|j)sx?$/,
                    /components\//,
                ],
            },
        }],
    ],
    history: 'hash',
    publicPath: "./",
    runtimePublicPath: true,
    proxy: {
        '/obs': {
          target: 'https://collisioninfo.obs.cn-north-4.myhuaweicloud.com',
          pathRewrite: { '^/obs': '' },
          changeOrigin: true
        },
        '/collision-server': {
            // target: 'http://yuxingsat.com/orbit/cloud-orbit/collision-server',
            target: 'http://10.2.0.116:8888/orbit/collision-server',
            pathRewrite: { '^/collision-server': '' },
            changeOrigin: true
        }
    },
    theme:{
        "component-background":"transparent", //@table-bg: @component-background;
        "heading-color":"#fff", //@table-header-color: @heading-color;
        // "primary-1":"rgba(50,59,136,1)", //@table-selected-row-bg: @primary-1;
        "border-color-split":"transparent", //@table-border-color: @border-color-split;
        "background-color-light":"rgba(50,59,136,.4)"  //@table-row-hover-bg: @background-color-light;
    }
}
