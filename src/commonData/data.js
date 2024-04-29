export default {
    namespace: 'data',    //models命名空间，需全局唯一
    state: {
        viewer: null,
        api:null
    },   //models存储的数据store
    reducers: {
        setApi(state,{payload}){
            state.api = payload
            return state
        }
    },  //同步操作
    effects: {

    },//异步操作
    subscriptions: {  //订阅，在app.start()即启动项目时被执行

    }
}