import axios from 'axios';
import URLS from '../../url.config'


const service = axios.create({
    baseURL:
        process.env.NODE_ENV === "production" //正式生产环境，程序最终发布后所需要的参数配置
            ? URLS.production.collisionServer
            : URLS.dev.collisionServer,
    timeout: 30000
});

//get请求
service.interceptors.response.use(
    response => {
        return Promise.resolve(response.data)
    },
    error => {
        return Promise.reject(error.response.status) // 返回接口返回的错误信息
    }
)
export function Get(url, params, headers) {
    return new Promise((resolve, reject) => {
        service.get(url, {params:params,headers})
        .then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err.data)
        })
    })
}

//post请求
export function Post(url, params ,headers) {
    return new Promise((resolve, reject) => {
        service.post(url,params,headers)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}
