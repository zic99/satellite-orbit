import * as Cesium from 'cesium';
import SAT from '../gltf/SAT.gltf'
import debris from '../gltf/o.glb';
import rocketWreckage from '../gltf/untitled2.glb'

class Coll{
	constructor(viewer){
		this.viewer = viewer;
		this.clickEvent = null;
		this.action = null;
		this.target = null;
		this.init();
	}
	init(){

	}
	removeAction(){
        const clickEvent1 = this.viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        const clickEvent2 = this.viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		console.log(clickEvent1)
		console.log(clickEvent2)

	}
	setAction(){
		this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
			this.action,
			Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
		)
	}
    redata(pvList,type,index,name){
		let res = new Cesium.SampledPositionProperty();
		res._referenceFrame = 1;
	
		pvList.forEach(i => {
			const { x, y, z, epoch } = i;
			res.addSample(new Cesium.JulianDate.fromDate(new Date(epoch)), new Cesium.Cartesian3(x , y , z ));
		})
		const velocityOrientation =  new Cesium.VelocityOrientationProperty(res);
		this.addEntity(res,velocityOrientation,type,index,name);
    }
	addEntity(res,v,type,index,name){
		const color = index===1 ? Cesium.Color.CYAN : Cesium.Color.RED;
		this[index===1 ? 'SAT' : "other"] = this.viewer.entities.add({
			availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
				start:this.start,
				stop:this.stop
			})]),
			path: {
				material :new Cesium.PolylineDashMaterialProperty({
					color:color,
					dashLength:10
				}),
				width: 1,
			},
			position:res,
			model:{
				uri:this.renderModel(type),
				minimumPixelSize:type === "SAT" ? 60 : 50
			},
			orientation:v,
			label:{
				text: name,
				font: '14px',
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				horizontalOrigin: Cesium.HorizontalOrigin.BOTTOM,
				pixelOffset: new Cesium.Cartesian2(0, 20),
			},
			id:index === 1 ? "SAT" : "other"
		});
		if(type === '1'){
			const p = this.SAT.position.getValue(this.viewer.clock.currentTime);
			this.viewer.camera.lookAt(p,new Cesium.Cartesian3(1000000,1000000,1000000));
		}
	}
	setTime(start, end,collisionTime) {
        const startTime = Cesium.JulianDate.fromDate(new Date(start));
        const stopTime = Cesium.JulianDate.fromDate(new Date(end));
		const eventTime = Cesium.JulianDate.fromDate(new Date(new Date(new Date(collisionTime)).getTime() - 20000	))

        this.viewer.clock.startTime = startTime.clone();
        this.viewer.clock.stopTime = stopTime.clone();
        this.viewer.clock.currentTime = eventTime;
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
		this.viewer.clock.multiplier = 1;
        // this.viewer.clock.zoomTo(startTime,stopTime)
        this.time = { start: startTime, end: stopTime };
        this.viewer.timeline.zoomTo(Cesium.JulianDate.fromDate(new Date(start)), Cesium.JulianDate.fromDate(new Date(end)));
		this.start = startTime;
		this.stop = stopTime;
    }
	clear(){
		this.viewer.entities.removeById("SAT");
		this.viewer.entities.removeById("other");
	}
	getPosition(target){
		const it = target === 1 ? this.SAT : this.other;
		const time = this.viewer.clock.currentTime;
		const car3 = it.position.getValue(time);
		if(!car3) return null;
		return this.transformCar3(car3);
	}
	transformCar3(car3) {
        const wgs = new Cesium.Cartographic.fromCartesian(car3);
        // const {lon}
        let { longitude, latitude, height } = wgs;
        longitude = Cesium.Math.toDegrees(longitude);
        latitude = Cesium.Math.toDegrees(latitude);
        return {lon:longitude.toFixed(2), lat:latitude.toFixed(2), alt:height.toFixed(2)}
    }
	viewToCenter(){
		console.log(this.SAT)
		console.log(this.other)
		const time = this.viewer.clock.currentTime;
		const p1 = this.SAT.position.getValue(time);
		const p2 = this.other.position.getValue(time);
		console.log(p1)
		console.log(p2)
		const p3 = Cesium.Cartesian3.midpoint (p1,p2,{});
		console.log(p3);
		this.viewer.camera.lookAt(p3,new Cesium.Cartesian3(100000,100000,100000));
	}
	renderModel (type){
        let model;
		console.log(type)
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
}
export default Coll;