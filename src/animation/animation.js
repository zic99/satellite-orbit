import * as Cesium from 'cesium';
import * as satellite from '../satellite.es.js';
import SAT from '../gltf/SAT.gltf'
import debris from '../gltf/o.glb';
import rocketWreckage from '../gltf/untitled2.glb'

const deltaTime = 500;

class Point {
    constructor(viewer) {
        this.viewer = viewer;
        this.window = null;
        this.pick = null;
        this.flag = false;
        this.satrecs = [];
        this.timerCollection = [];
        this.pointPrimitives = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
        this.positionCollection = [];
        this.init();
        this.trackedIndex = null;
        this.trackedEntity = this.viewer.entities.add({
            model: {
                uri: SAT,
                minimumPixelSize: 50
            },
            id: 'track',
            selectionIndicator:false
        })
        this.tles = {};
        this.orbit = [];
        this.times = 0;
        this.originTime = 0;
        this.listener = null;
    }
    init() {
        // this.calcPosition();
        // this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(timeStart));
        this.clock();
        // this.mouseclick();
        this.cameraMove();
        this.formatTime();
        this.earthRotate();
        this.stringTrim();
    }
    stringTrim() {
        String.prototype.ResetBlank = function () {
            var regEx = /\s+/g;
            return this.replace(regEx, ' ');
        };
    }
    selected(i){
        // console.log(i)
        // const it = this.viewer.entities.getById("orbit" + i);
        // it.path = { 
        //     width:1,
        //     leadTime:this.tles[i].duration / 2 ,
        //     trailTime:this.tles[i].duration / 2 
        // }
        const {type,duration} = this.tles[i];
        const color = this.renderColor(type);
        this.viewer.entities.add({
            availability:new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start:Cesium.JulianDate.fromDate(new Date("1980-01-01")),
                stop:Cesium.JulianDate.fromDate(new Date("2030-01-01"))
            })]),
            position:this.positionCollection[i],
            path:{
                width:1,
                trailTime:duration,
                material:color
            },
            orientation:new Cesium.VelocityOrientationProperty(this.positionCollection[i]),
            id:"orbit"
        })
    }
    calcOrbit(index) {
        const {satrec,duration} = this.tles[index];
        // samp.setInterpolationOptions({
        //     interpolationDegree: 1,
        //     // interpolationAlgorithm: Cesium.HermitePolynomialApproximation ,
        // })
        const now = new Date(Cesium.JulianDate.toDate(this.viewer.clock.currentTime)).getTime();
      
        const num = Math.ceil(duration / deltaTime);
        for (let i = 0; i <= num; i ++) {
            console.log(i * deltaTime);
            const timeCalc = new Date(now - i * deltaTime * 1000);
            const position = satellite.propagate(satrec, timeCalc);
            // if(satrec.error) break
            if (position instanceof Array || !position) {
                return
            }
          
            this.positionCollection[index].addSample(Cesium.JulianDate.fromDate(new Date(timeCalc)), position);
            
        }
        this.positionCollection[index].setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation ,
        })
        console.log("calcObritOver")
    }
    initAll(tle) {
        const now = Cesium.JulianDate.toDate(this.viewer.clock.currentTime).getTime();
        this.originTime = now; 
        let index = 0;
        for(let key in tle){
            index ++;
            
            const item = tle[key];
            const satrec = satellite.twoline2satrec(item.tle1, item.tle2); //const
            // console.log(satrec)
            const duration = 2 * Math.PI / satrec.no * 60;
            const color = this.renderColor(item.type);
            const samp = new Cesium.SampledPositionProperty();
            samp.setInterpolationOptions({
                interpolationDegree: 5,
                interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
            })
            let a = [];
            // 步长为10s
            for(let i = 0 ; i <= duration ; i+= 600){
                const timeCalc = new Date(now + i * 1000);
                const position = satellite.propagate(satrec, timeCalc);
                if (position instanceof Array || !position || position.position === false) {
                    continue;
                }
                const { x, y, z } = position;
                // 笛卡尔3转经纬度
              
                    // 笛卡尔转经纬度
                    const pos = this.transformCar3(position);              
                    a.push({
                        t:timeCalc,
                        pos:{...position,...pos}
                    })
                samp.addSample(Cesium.JulianDate.fromDate(timeCalc), new Cesium.Cartesian3(x, y, z));
            }
          
            this.positionCollection.push({
                positions:samp,
                duration,
                color,
                key
            });
        }
        console.log(this.positionCollection)
        this.initPoint()
    }
    initPoint(){
        // primitiveCollection add point
        this.pointPrimitives = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
        
        const now = +Cesium.JulianDate.toDate(this.viewer.clock.currentTime);
        for(let i = 0 ; i < this.positionCollection.length ; i++){
            const {positions,color,key} = this.positionCollection[i];
            const position = this.renderNowPosition(i,now);
            this.pointPrimitives.add({
                position:position,
                id:key,
                color:color,
                pixelSize:2,
            })
           
        }
        this.updatePosition();
    }
    renderNowPosition(i,now){
        const {positions,duration,key} = this.positionCollection[i];
        const delta = (now - this.originTime) % (duration*1000);
        const p = positions.getValue(Cesium.JulianDate.fromDate(new Date(this.originTime + delta)));
        return p || Cesium.Cartesian3.ZERO;
    }
    updatePosition(){
        // requestAnimationFrame(this.updatePosition.bind(this));
        const fn = (_,time)=>{
                const now = +Cesium.JulianDate.toDate(time);
                for(let i = 0 ; i < this.positionCollection.length ; i++){
                    const {positions,color} = this.positionCollection[i];
                    const position = this.renderNowPosition(i,now);
                    // change point position
                    // console.log(position)
                    const point = this.pointPrimitives.get(i);
                    point.position = position;
            }
        }
        this.viewer.scene.preRender.addEventListener(fn);
        this.listener = fn;
    }
    cameraMove() {
        this.viewer.camera.moveBackward(100000000);
    }
    mouseclick() {
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        const doubleClick = (movement)=>{
            const pick = this.viewer.scene.pick(movement.position);
            clearTimeout(this.clickTimer);
            console.log(pick)
            if(!pick){
                const i = this.trackedIndex;
                if(i) {
                    this.viewer.entities.removeById("model");
                    this.viewer.entities.getById(i).show = true;
                }
                this.trackedIndex = null;
                this.viewer.trackedEntity = null;
            }
            if(pick?.primitive instanceof Cesium.PointPrimitive){
                if(pick && pick.id && pick.id.id){
                    const i = pick.id.id.toString().replace(/[^0-9]/ig,"");
                    this.trackedIndex = i;
                    
                    this.viewer.entities.getById(i).show = false;
                
                    this.trackedIndex = i;
                    this.viewer.entities.removeById("orbit");
                    console.log(i)
                    this.calcOrbit(i);
                    this.showOrbit(i);
                }
            }
        }

        const click =(movement) =>{
            const pick = this.viewer.scene.pick(movement.position);
            clearTimeout(this.clickTimer);
            if(this.viewer.entities.getById("model")) return;
            this.clickTimer = setTimeout(() => {
                if (Cesium.defined(pick)) {
                    console.log(pick)
                    if (!pick.id) return
                    if(pick.id.id){
                        if(pick.id.id === "model") return;
                        const i = pick.id.id.toString().replace(/[^0-9]/ig,"");
                        if(i === this.trackedIndex) {
                            console.log("break");
                            return;
                        };
                        console.log("continue")
                        if(pick.primitive instanceof Cesium.Polyline){
                            // click the polyline 取消/删除
                            this.viewer.entities.removeById("orbit");
                        }else if(pick.primitive instanceof Cesium.PointPrimitive){
                            this.viewer.entities.removeById("orbit");
                            this.calcOrbit(i);
                            this.selected(i);
                        }
                        else if(pick.primitive instanceof Cesium.Model){
                            console.log(pick.id)
                            if(pick.id.path) {
                                pick.id.path.width = pick.id.path.width === 0 ? 1 : 0;
                                pick.id.path.show = true
                            }
                        }
                    }
                }
            }, 500);
        }
        handler.setInputAction(doubleClick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        handler.setInputAction(click, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.calcenHandler = ()=>{
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
    showOrbit(i) {
        this.viewer.entities.removeById("model");
        const {duration,type} = this.tles[i];
        const color = Cesium.Color[this.renderColor(type)];
        console.log(color)
        const model = this.viewer.entities.add({
            availability:new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start:Cesium.JulianDate.fromDate(new Date("1980-01-01")),
                stop:Cesium.JulianDate.fromDate(new Date("2030-01-01"))
            })]),
            position:this.positionCollection[i],
            path:{
                width:1,
                trailTime:duration,
                material:color
            },
            model:{
                uri:this.renderModel(type),
                minimumPixelSize:40
            },
            orientation:type === "2" ? new Cesium.VelocityOrientationProperty(this.positionCollection[i]) : new Cesium.Quaternion ( Math.random()*1 , Math.random()*1 , Math.random()*1 , Math.random()*1 ),
            id:"model"
        })
        this.viewer.trackedEntity = model;
    }
    renderColor (type){
        let color;
        switch(type){
            case '1':
                color = Cesium.Color.CHARTREUSE ; 
                break;
            case '2':
                color = Cesium.Color.GRAY; //火箭
                break;
            case '3':
                color = Cesium.Color.RED; //碎片
                break;
        }
        return color;
    }
    renderModel (type){
        let model;
        switch(type){
            case '1':
                model = SAT;
                break;
            case '2':
                model = debris;
                break;
            case '3':
                model = rocketWreckage;
                break;
        }
        return model;
    }
    clock() {
        this.viewer.clock.startTime = Cesium.JulianDate.fromDate(new Date('2000-01-01'));
        this.viewer.clock.stopTime = Cesium.JulianDate.fromDate(new Date('3000-01-01'));
        this.viewer.timeline.zoomTo(Cesium.JulianDate.fromDate(new Date()),Cesium.JulianDate.fromDate(new Date(new Date().getTime() + 86400000)))
       
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        this.viewer.clock.multiplier = 1;
    }
    transformCar3(car3) {
        const wgs = new Cesium.Cartographic.fromCartesian(car3);
        // const {lon}
        let { longitude, latitude, height } = wgs;
        longitude = Cesium.Math.toDegrees(longitude)
        latitude = Cesium.Math.toDegrees(latitude)
        return { longitude, latitude, height }
    }
    formatTime() {
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,                 //月份 
                "d+": this.getDate(),                    //日 
                "h+": this.getHours(),                   //小时 
                "m+": this.getMinutes(),                 //分 
                "s+": this.getSeconds(),                 //秒 
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                "S": this.getMilliseconds()             //毫秒 
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    }
    earthRotate() {

        // this.viewer.clock.shouldAnimate = true;
        let previousTime = this.viewer.clock.currentTime
        const onTickCallback = () => {
            
            if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) return

            let spinRate = .0728;
            let currentTime = this.viewer.clock.currentTime;
            if (!previousTime) {
                previousTime = currentTime;
                return
            }
            let delta = Cesium.JulianDate.secondsDifference(currentTime, previousTime) / 1000;

            previousTime = currentTime;
            if(this.trackedIndex) return
            this.viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, spinRate * delta);
        }

        // 开启地图自转效果
        this.viewer.clock.onTick.addEventListener(onTickCallback);
    }
    focusTarget() {
        const time = this.viewer.clock.currentTime;
        const point1 = this.positionCollection[2].getValue(time);
        const point2 = this.positionCollection[3].getValue(time);

        const distance = Cesium.Cartesian3.distance(point1, point2, {});
        const midPoint = Cesium.Cartesian3.midpoint(point1, point2, {});

        console.log(point1, point2)
        console.log(midPoint)
        this.viewer.camera.setView({
            destination: point1,
            orientation: {
                heading: Cesium.Math.toRadians(0), // east, default value is 0.0 (north)
                pitch: Cesium.Math.toRadians(0),    // default value (looking down)
                roll: 0.0                             // default value
            }
        });
        this.viewer.camera.moveBackward(distance)
        this.dispalyPosition(point1, 'BLUE');
        this.dispalyPosition(point2, 'RED');
        this.dispalyPosition(midPoint, 'GREEN');
    }
    dispalyPosition(car3, color) {
        this.viewer.entities.add({
            position: car3,
            point: {
                pixelSize: 20,
                color: Cesium.Color[color]
            }
        })
    }
    cancelClickEvent(){
        if(this.calcenHandler) this.calcenHandler();
    }
    removeAll(){
        if(this.listener) this.viewer.scene.preRender.removeEventListener(this.listener);
        this.viewer.scene.primitives.removeAll();

        this.viewer.trackedEntity = null;
        this.viewer.entities.removeAll();
        this.positionCollection = [];
        this.listener = null;
        this.tles = {};
    }

}

export default Point