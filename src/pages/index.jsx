import { useEffect, useRef, useState ,useCallback  } from 'react';
import withRouter from 'umi/withRouter';
import style from './index.css';
import "cesium/Source/Widgets/widgets.css";
import * as Cesium from 'cesium';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';

import Animation from '../animation/animation.js';
import earth from '../assets/Earth_Diffuse_8K.jpg';
import earthLight from '../assets/Earth_Night_6K.jpg'

import * as collServer from "../http/collServer.js";
import * as obs from '../http/obs.js';

import Dash from '../component/dashBorder/dashBorder.jsx'

import {columns,warnColumns} from './columns';
import {Table} from 'antd';
import Coll from '../animation/coll'

import h00h_00 from '../../public/skybox/00h+00.jpg';
import h06h_00 from '../../public/skybox/06h+00.jpg';
import h06h_90 from '../../public/skybox/06h+90.jpg';
import h06h__90 from '../../public/skybox/06h-90.jpg';
import h18h_00 from '../../public/skybox/18h+00.jpg';
import h12h_00 from '../../public/skybox/12h+00f.jpg';

buildModuleUrl.setBaseUrl('cesium');


function Index(){
    const cesiumContainer = useRef(null);
    const [ceApi,setScene] = useState(null);
    const [collApi,setCollApi] = useState(null);
    const [tle,setTle] = useState(null);
    const [showRecommend,setShowRecommend] = useState(false);
    const [detail,setDetail] = useState(null);
    const [viewer,setViewer] = useState(null);
    const [warnListState,setWarnListState] = useState(false);
    useEffect(_=>{
        const initViewer = new Cesium.Viewer(cesiumContainer.current, {
            geocoder: false, //搜索查询
            // animation: false, //仪表盘
            navigationHelpButton: false,
            infoBox: false,
            // fullscreenButton:false,
            shouldAnimate:true,
            baseLayerPicker:false,
            imageryProvider:new Cesium.SingleTileImageryProvider({
                // credit: "",
                url:  earth
            }),
            scene3DOnly: true,
            // requestRenderMode:true,
            selectionIndicator: false,
            homeButton:false,
            // imageryProvider: new Cesium.IonImageryProvider({ assetId: 3845 }),
            showRenderLoopErrors:false,
            
        });
        initViewer._cesiumWidget._creditContainer.style.display="none"; //hidden ©
        initViewer.scene.skyAtmosphere.show = false;  
        // initViewer.cesiumWidget.targetFrameRate = 30;
        // initViewer.scene.globe.enableLighting = true;
        // initViewer.shadows = true;
        
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(70, 70, 130, -20);
        const clickEvent = initViewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        // initViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // initViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        

        initViewer.scene.globe.baseColor = Cesium.Color.WHITE;//设置地球颜色
        initViewer.scene.globe.showGroundAtmosphere = false;
        initViewer.scene.globe.enableLighting = true;
        initViewer.scene.globe.lightingFadeInDistance = 0;
        initViewer.scene.globe.lightingFadeOutDistance = 0;
        const layer = initViewer.scene.imageryLayers.addImageryProvider(
            new Cesium.SingleTileImageryProvider({
                url: earthLight
            })
        )
        layer.dayAlpha = 0 //白天图层透明值
        layer.nightAlpha = 0.3 //夜晚图层透明值
        layer.brightness = 6//图层发光亮度
        initViewer.scene.shadows = false
        


        initViewer.scene.skyBox.show = false;
        initViewer.scene.skyBox = new Cesium.SkyBox({
            sources: {
                positiveX: h00h_00,
                negativeX: h12h_00,
                positiveY: h06h_00,
                negativeY: h18h_00,
                positiveZ: h06h_90,
                negativeZ: h06h__90,
            }
        });
        initViewer.scene.debugShowFramesPerSecond = true; //fps
        setViewer(initViewer);
        const scene = new Animation(initViewer);
        const collScene = new Coll(initViewer);
        collScene.action = clickEvent;
        setCollApi(collScene);
        setScene(scene);
    },[setScene,setCollApi,setViewer])


    // hideAll
   
    useEffect(_=>{
        String.prototype.ResetBlank=function(){
            var regEx = /\s+/g;
            return this.replace(regEx, ' ');
        };
    },[])


    const getData = useCallback(()=>{
        const getType = (tle)=>{
            if(tle.indexOf("DEB")!== -1){
                return '2'
            }else if(tle.indexOf("R/B")!== -1){
                return '3'
            }else{
                return '1'
            }
        }
        obs.Get("/TLEInfo.json").then(res=>{
            let format = {};
            
            
            res.forEach(item=>{
                format[item.tle2.slice(2,7)] = item;
                item.type = getType(item.tle0)
            })
            console.log(format)
            setTle(format);
        })
    },[setTle])

    useEffect(()=>{
        getData();
    },[getData])
    
  
    
    useEffect(()=>{
        if(!ceApi || !tle) return;
        ceApi.removeAll();
        ceApi.initAll(tle);

        // ceApi.oneOrbit(tle[0]);

        // ceApi.handleAllData(tle);
        // ceApi.handleAllData1(tle);
        // ceApi.calcPositionRealTime(tle)
        // return

        // ceApi.test1(tle[0])
        // ceApi.test2(tle[0])

        // ceApi.updatePosition();
        // ceApi.calcPosition([tle[0]]);
    },[ceApi,tle])


    const [list,setList] = useState([]);
    useEffect(_=>{
        obs.Get("/ManeuverResult.json").then(res=>{
            setList(res.data);
        })
    },[setList])

    Date.prototype.format = function(fmt) { 
        var o = { 
            "M+" : this.getMonth()+1,                 //月份 
            "d+" : this.getDate(),                    //日 
            "h+" : this.getHours(),                   //小时 
            "m+" : this.getMinutes(),                 //分 
            "s+" : this.getSeconds(),                 //秒 
            "S"  : this.getMilliseconds()             //毫秒 
        }; 
        if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
        }
            for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
        return fmt; 
    }


    // left
    const time = useRef(null);
    const [current,setCurrent] = useState(null);

    useEffect(()=>{
        if(!viewer) return;
        console.log(viewer.clock.currentTime)
        setCurrent(Cesium.JulianDate.toDate(viewer.clock.currentTime).format("yyyy-MM-dd hh:mm:ss"));
        time.current = setInterval(() => {
            setCurrent(Cesium.JulianDate.toDate(viewer.clock.currentTime).format("yyyy-MM-dd hh:mm:ss"));
            // setCurrent("2021-12-20 18:02:03")
        }, 1000);

        return ()=>{clearInterval(time.current)};
    },[setCurrent,viewer])
    
    
    const [options,setOptions] = useState(null);
    const [info,setInfo] = useState(null);

    useEffect(()=>{
        if(!detail?.length) return;
        const res = detail[0];
        setInfo({
            ...res,
            target:1
        })
    },[detail])
    const changeInfo = useCallback((index)=>{
        setInfo({...detail[index-1],target:index});
    },[setInfo,detail])


    const targetInfo = useRef(null);
    const [position,setPosition] = useState({});
    useEffect(()=>{
        targetInfo.current = setInterval(() => {
            if(!info) return;
            const res = collApi.getPosition(info.target);
            if(res) {
                setPosition(res)
            }
        }, 500);
        return ()=> clearInterval(targetInfo.current);
    },[collApi,info,setPosition])
    const showInfo = useCallback(_=>{
        if(!info) return;
        return(
            <div className={style.infoForm}>
                <div>
                    <span>NORAD</span>
                    <span>apogee</span>
                    <span>perigee</span>
                    <span>i</span>
                    <span>e</span>
                    <span>age</span>
                    <span>lon</span>
                    <span>lat</span>
                    <span>alt</span>
                </div>
                <div>
                    <span>{info.norad}</span>
                    <span>{(Number(info.apogee) / 1000) ?.toFixed(2)}km</span>
                    <span>{(Number(info.perigee) / 1000) ?.toFixed(2)}km</span>
                    <span>{info.i}°</span>
                    <span>{info.e}</span>
                    <span>{info.age?.toFixed(2)} days</span>
                    <span>{position.lon || "/"} °</span>
                    <span>{position.lat || "/"} °</span>
                    <span>{(position.alt/1000).toFixed(1) || "/"} km</span>
                </div>
            </div>
            )
    },[info,position])

    const [moreRecommend,setMoreRecommend] = useState(false);
    const renderMoreRecommend = useCallback(_=>{
        if(!moreRecommend) return;
    
        return <div className={style.allRecommend}>
            <div className={style.tableCtrl}>
                <span onClick={()=>{setMoreRecommend(false)}}>x</span>
            </div>
            <Table
                scroll={{ y: 420 }}
                columns={columns}
                dataSource={options.Maneuver}
                bordered
                size="middle"
                pagination={false}
                rowKey={(_,i) => i}
            />
        </div>
    },[moreRecommend,info])
    const renderTrackCtrlRecommend = useCallback(_=>{
        // recommendList
        if(!options || !showRecommend || moreRecommend || warnListState) return;
        return(
            <div className={style.recommend}>   
                <div className={style.tableHeadInfo}>
                    <div>
                        <span>卫星：{options.NORADNum1}</span>
                        <span>目标：{options.NORADNum2}</span>
                        <span>轨控时刻：{options.ManeuverEpoch}</span>
                    </div>
                    <div>
                        <span>TCA:{options.CollisionTime}</span>
                        <span>Distance(km,Total/U/N/W) {options.MinRange}/{options.RangeU}/{options.RangeN}/{options.RangeW}</span>
                    </div>
                </div>
                <div className={style.recommendTable}>
                    <div>
                        <Table
                            columns={columns}
                            dataSource={options.Maneuver.filter(i=>i.Da >= 20 && i.Recommend ===1).slice(0,20)}
                            bordered
                            size="middle"
                            pagination={false}
                            rowKey={(_,i) => i}
                            scroll={{y:565}}
                        />
                    </div>
                    {/* <div className={style.moreRecommend}><span onClick={()=>setMoreRecommend(true)}>更多</span></div> */}
                </div>
            </div>
        )
    },[options,showRecommend,moreRecommend,warnListState])
    

    const renderOptions = useCallback(_=>{
        if(!options || !detail) return;
        
        return(
            <div className={style.targetInfo}>
                <div className={style.options}>
                    <div onClick={()=>changeInfo(1)}>{detail[0].targetName}-{detail[0].norad}</div>
                    <div onClick={()=>changeInfo(2)}>{detail[1].targetName}-{detail[1].norad}</div>
                </div>
                <div className={style.line}></div>
                {showInfo()}    
            </div>
        )
    },[options,detail,showInfo])

    const collDeatil = useCallback((NORADNum1,NORADNum2,collisionTime)=>{
        // Get("/coll_detail",{
        //     norad:noradnum1,
        //     tca:collisionTime
        // }).then(res=>{
        //     console.log(res)
        // })
        // Get("/coll_detail",{
        //     norad:noradnum2,
        //     tca:collisionTime
        // }).then(res=>{
        //     console.log(res)
        // })
        const renderTle = (id)=>{
            console.log(tle)
            const {tle0,tle1,tle2} = tle[id];
            return {tle0,tle1,tle2}
        }
        console.log({
            ...renderTle(NORADNum1),
            tca:collisionTime
        })
        Promise.all([
            collServer.Get("/coll_detail",{
                ...renderTle(NORADNum1),
                tca:collisionTime
            }),
            collServer.Get("/coll_detail",{
                ...renderTle(NORADNum2),
                tca:collisionTime
            })
        ]).then(res=>{
            console.log(res)
            setDetail(res)
            initCollScene(res,collisionTime);
            setInfo(null);
        })
    },[collApi,setInfo,setDetail,tle])
    
    const initCollScene = useCallback((res,collisionTime)=>{
        const list1 = res[0].pvList;
        const list2 = res[1].pvList;
        const start = list1[0].epoch;
        const end = list1[list1.length -1].epoch;
        collApi.setAction();
        collApi.clear();
        collApi.setTime(start,end,collisionTime);
        collApi.redata(list1,res[0].type,1,res[0].targetName);
        collApi.redata(list2,res[1].type,2,res[1].targetName);
        
    },[collApi])

    const selectedItem = useCallback(item=>{
        setWarnListState(false);
        setTimeout(() => {
            const {NORADNum1,NORADNum2,CollisionTime} = item;
            ceApi.cancelClickEvent();
            ceApi.removeAll();
            console.log(item)
            setOptions(item);
            collDeatil(NORADNum1,NORADNum2,CollisionTime);
        }, 500);
    },[setOptions,ceApi,setWarnListState,collDeatil,tle])




    const warntableBox = useRef(null);
    const renderWarningList = useCallback(_=>{
        if(!list) return;
        return(
            <div className={style.tablebox} ref={warntableBox}>
                <Table dataSource={list} 
                    columns={warnColumns}
                    scroll={{ y: warntableBox.current?.clientHeight - 70 || 500}}
                    pagination={ false }
                    onRow={(record)=>{
                        return {
                            onClick:()=>selectedItem(record)
                        }
                    }}
                />
            </div>
        )
    },[list,tle])


    const reset = useCallback(_=>{
        ceApi.viewer.camera.flyHome(1);
        setWarnListState(false);
        setOptions(null);
        setMoreRecommend(false);
        setInfo(null);
        setShowRecommend(false);
        
        ceApi.clock();
        // ceApi.mouseclick();
        ceApi.removeAll();
        //防止卡顿
        setTimeout(() => {
            getData();
        }, 1000);
    },[ceApi,getData,setOptions,setWarnListState,setMoreRecommend,setInfo,setShowRecommend])


    const goHome = useCallback(_=>{
        console.log(ceApi)
        if(!ceApi) return;
        ceApi.viewer.camera.flyHome(1);
    },[ceApi])

    const changeSpeed = useCallback(num=>{
        if(!ceApi) return;
        ceApi.viewer.clock.multiplier = num;
    },[ceApi])

    const openWarningList = useCallback(()=>{
        setWarnListState(!warnListState)
    },[warnListState])
    
    const openTrackControlList = useCallback(()=>{
        setShowRecommend(!showRecommend);
    },[showRecommend])
    return(
        <div className={style.layouts}>
            {/* {renderWarning()} */}
            {/* <div className={style.title}></div> */}
            
            <div className={`${style.warningList} ${warnListState? style.normal : style.hide}`}>
                {renderWarningList()}
            </div>
            
            <div ref={cesiumContainer} className={style.scene}></div>
            
        
            {renderOptions()}
            {renderTrackCtrlRecommend()}
            {/* {renderMoreRecommend()} */}
            <div className={style.ctrls}>
                <div onClick={reset}>
                    <img src={require("../assets/icon/chongzhi.png")} title='刷新'/>
                </div>
                <div onClick={goHome}>
                    <img src={require("../assets/icon/shouye.png")} title='重置视角'/>
                </div>
                <div onClick={openWarningList}>
                    <img src={require("../assets/icon/liebiao.png")} title='打开碰撞列表'/>
                </div>
                <div onClick={openTrackControlList}>
                    <img src={require("../assets/icon/jieguo.png")} title='打开轨控结果'/>
                </div>
            </div>
            {/* <Dash changeSpeed={changeSpeed} current={current}></Dash> */}
        </div>
    )
}
export default withRouter(Index);
