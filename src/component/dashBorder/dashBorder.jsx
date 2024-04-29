import style from './dash.css'
import { useCallback, useEffect,useRef } from 'react'
import withRouter from 'umi/withRouter';
import { useState } from 'react';

function Dash(props){
	const svg = useRef(null);
	const needle = useRef(null);
	const scale = useRef(null);
	const dash = useRef(null);
	const [a,setA] = useState(1);

	const [needlePoints,setNeedlePoints] = useState("100,140 28,137 100,140");
	const [isDragging,setIsDragging] = useState(false);
	/**
	 * 70 10 
	 * 50 210
	 * 130 250
	 * 140 210
	 */
	
	const {changeSpeed,current} = props;
	
	var cy = 150;

	const format = ([x,y]) => ( [x + 100,100 - y])
	let h = 10
	let m_r = 70
	let angle = 60 * Math.PI / 180
	useEffect(()=>{
		drawNeedle(1/500);
	},[])
	const drawNeedle = useCallback((a)=>{
		const calcPoint = (alpha)=>{
			let up = [0,0];
			let down = [0,0];
			let r = Math.PI - alpha;
			let mid = [(m_r - h) * Math.cos(r),(m_r - h) * Math.sin(r)];
			let k =  -1 / Math.tan(r);
			let nk = Math.atan(k)
			let da = h / Math.tan(angle);
			up = format([mid[0] + da * Math.cos(nk),mid[1] + da* Math.sin(nk)])
			down = format([mid[0] - da* Math.cos(nk),mid[1] - da* Math.sin(nk)])
			let newMid = format([m_r * Math.cos(r),m_r * Math.sin(r)])
			return {up,down,mid:newMid}
		}
	
		const {up,down,mid} = calcPoint(a);
		
		var points = up[0] + "," + up[1] + " " + mid[0] + "," + mid[1] + " " + down[0] + "," + down[1];

		setNeedlePoints(points);
	},[setNeedlePoints])

	// helpers
	const oMousePos = useCallback((elmt, evt)=>{
		var ClientRect = elmt.current.getBoundingClientRect();
		return {
			x: Math.round(evt.clientX - ClientRect.left),
			y: Math.min(Math.round(evt.clientY - ClientRect.top), cy)
		}
	},[])
	
	const svgClick = useCallback((evt)=>{
		setIsDragging(true)
	},[setIsDragging])
	
	const svgMouseMove = useCallback((evt)=>{
		if (isDragging) {
			var mousePos = oMousePos(svg, evt);
			const alpha = Math.atan2(100 - mousePos.y,100 - mousePos.x);
			if(alpha>=0 && alpha <= Math.PI) drawNeedle(alpha)
			setA(Math.ceil(Math.min(Math.max(alpha / Math.PI * 180,0),180) / 180 * 500))
		}
	},[isDragging,oMousePos,setA])

	useEffect(()=>{
		if(!scale.current) return;
	},[scale])

	const changeEnd = useCallback(()=>{
		setIsDragging(false);
	},[setIsDragging,a])
	

	const handleSpeddChange = useCallback(speed=>{
		let s = 0;
		if(speed){
			s = Math.max(Math.min(a+speed,500),0);
		}else{
			s = 0;
		}
		setA(s);
		drawNeedle(s / 160)
	},[a])

	useEffect(()=>{
		console.log(a)
		clearInterval(dash.current)
		dash.current = setTimeout(() => {
			changeSpeed(a)
		}, 100);
		return ()=>{
			clearInterval(dash.current)
		}
	},[a,dash])
	return(
		<div className={style.container} ref={dash}>
			<svg className={style.typeRange} height="180" width="200" view-box="0 0 200 165" 
				ref={svg} 
				onMouseDown={svgClick} 
				onMouseUp={()=>changeEnd()}
				onMouseOut={()=>{setIsDragging(false)}}
				onMouseMove={(e)=>{svgMouseMove(e)}}
			>
				{/* <g className={style.scale} stroke="red" ref={scale}>
					{renderScale()}
				</g> */}

				{/* <path className={style.outline} d={d1} ref={outline}/>
				<path className={style.fill} d={d2} ref={fill}/> */}
				<polygon className={style.needle} points={needlePoints}  ref={needle}/>
			</svg>
			<div className={style.speed}>{a}x</div>
			<div className={style.time}>
				<p>{current?.split(" ")[0]}</p>
				<p>{current?.split(" ")[1]}</p>
			</div>
			<div className={style.btns}>
				<img src={require("../../assets/left.png")} onClick={()=>handleSpeddChange(-5)}/>
				<img src={require("../../assets/playStatus.png")} onClick={()=>handleSpeddChange(0)}/>
				<img src={require("../../assets/right.png")} onClick={()=>handleSpeddChange(+5)}/>
			</div>
		</div>
	)
}
export default withRouter(Dash);