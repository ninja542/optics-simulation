var app = new Vue({
	el: "#wrapper",
	data: {
		name: "Convex Lens",
	},
});

// margins
var margin = { top: 40, right: 40, bottom: 40, left: 40 },
		width = 1000 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;
var svg = d3.select('#simulation')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.select('#transform')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// variable thing to get the circle drag to work
var circleEye = [
		{x: 0, y: 0}
];
// make the circle
var eye = svg.selectAll("circle").data(circleEye).enter().append('circle')
		.attr('cx', function(d){ return d.x; })
		.attr('cy', function(d){ return d.y; })
		.attr('r', 10)
		.style('fill', '#000')
		.attr("id", "eye");

// implement graph
// x axis scaling stuff
var xScale = d3.scaleLinear().domain([-100, 100]).range([0, width]);
var xAxis = d3.axisBottom(xScale);
// y axis scaling stuff
var yScale = d3.scaleLinear().domain([100, -100]).range([0, height]);
var yAxis = d3.axisLeft(yScale);
// make the axes
svg.append("g").call(xAxis).attr("transform", "translate(" + 0 + ", " + yScale(0) + ")");
svg.append("g").call(yAxis).attr("transform", "translate(" + xScale(0) + ", " + 0 + ")");

// variables for getting center of mirror, object, etc
var mirrorBound = d3.select('#mirror').node().getBoundingClientRect();
var pencilBound = d3.select("#object").node().getBoundingClientRect();
var eyeBound = d3.select("#eye").node().getBoundingClientRect();

// positioning things at the start
d3.select("#mirror").attr("transform", "translate(" + (xScale(0)) + ", " + (yScale(0) - mirrorBound.height/2) + ")");
d3.select("#object").attr("transform", "translate("+(xScale(-40) - pencilBound.width/2)+","+(yScale(0) - pencilBound.height/2)+")");
d3.select("#eye").attr("transform", "translate(" + xScale(-40) + ", " + yScale(40) + ")");
svg.select("#object-image").attr("transform", "translate("+(xScale(40) - pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");

// ray tracing code
//plane mirror
if (app.name === "Plane Mirror"){
	let solidRayTop = function(){
		//update object bounds
		boundUpdate();
		// plane mirror ray tracing
		return [
			{x: eyeBound.x - margin.right + window.scrollX, y: eyeBound.y - margin.top + window.scrollY},
			{x: xScale(0), y: equalAngleHeight(eyeBound, pencilBound, pencilBound.y)},
			{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y - margin.top + window.scrollY}
		];
	};
	let dashedRayTop = function(){
		boundUpdate();
		return [solidRayTop()[1], {x: imageBound.x - margin.left + window.scrollX, y: imageBound.y - margin.top + window.scrollY}];
	};
	let dashedRayBottom = function(){
		boundUpdate();
		return [solidRayBottom()[1], {x: imageBound.x - margin.right - imageBound.width + window.scrollX, y: imageBound.y + imageBound.height - margin.top - 9 + window.scrollY}];
	};
	// need to fix positioning soon tomorrow then I can finally move on to curved mirrors
	let solidRayBottom = function(){
		boundUpdate();
		return [
				{x: eyeBound.x- margin.right + window.scrollX, y: eyeBound.y - margin.top + window.scrollY},
				{x: xScale(0), y: equalAngleHeight(eyeBound, pencilBound, pencilBound.y + pencilBound.height - 9)},
				{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY}
		];
	};
	// calculate the correct angle and height stuff
	let equalAngleHeight = function(eyeBound, pencilBound, pencilY){
		var x1 = xScale(0) - eyeBound.x + margin.right - window.scrollX;
		var x2 = xScale(0) - pencilBound.right + margin.right - window.scrollX;
		// y coordinate of eye * x1 + y coord of pencil * x2 = mystery y coord(x1 + x2)
		var y1 = eyeBound.y - margin.top + window.scrollY;
		var y2 = pencilY - margin.top + window.scrollY;
		return (y2 * x1 + y1 * x2)/(x1 + x2);
	};

	//drawing the lines
	let line = d3.line().x(function(d){ return d.x; }).y(function(d){ return d.y; });
	svg.append("path").attr("d", line(solidRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "solidRayTop");
	svg.append("path").attr("d", line(dashedRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("stroke-dasharray", "5, 10").attr("class", "dashedRayTop");
	svg.append("path").attr("d", line(solidRayBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "solidRayBottom");
	svg.append("path").attr("d", line(dashedRayBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("stroke-dasharray", "5, 10").attr("class", "dashedRayBottom");

	// general drag code for non circle things
	let mirrorDrag = d3.drag().on("start", dragstarted).on("drag", dragmove);
	d3.select("#object").call(mirrorDrag);
	function dragstarted(){
		// redraws the object to be on top
		d3.select(this).raise();
	}
	function dragmove(){
			// gets the bounding rectangle so we can find the center
			let bound = this.getBoundingClientRect();
			var x = d3.event.x - (bound.width/2);
			var y = d3.event.y - (bound.height/2);
			d3.select(this).attr("transform", "translate("+(Math.min(x, xScale(0) - bound.width))+","+y+")");
			svg.select("#object-image").attr("transform", "translate(" + (Math.max(xScale(0), xScale(100) - d3.event.x - bound.width/2)) + "," + y + ")");
			d3.select(".solidRayTop").attr("d", line(solidRayTop()));
			d3.select(".dashedRayTop").attr("d", line(dashedRayTop()));
			d3.select(".solidRayBottom").attr("d", line(solidRayBottom()));
			d3.select(".dashedRayBottom").attr("d", line(dashedRayBottom()));
	}
	// call the circle and drag it
	eye.call(d3.drag().on("drag", circledrag));
	// set the x and y attributes to the same as the dragging
	function circledrag(d){
			d3.select(this).attr("cx", d.x = Math.min(xScale(-60) - 10, d3.event.x)).attr("cy", d.y = d3.event.y);
			d3.select(".solidRayTop").attr("d", line(solidRayTop()));
			d3.select(".dashedRayTop").attr("d", line(dashedRayTop()));
			d3.select(".solidRayBottom").attr("d", line(solidRayBottom()));
			d3.select(".dashedRayBottom").attr("d", line(dashedRayBottom()));
	}
}
else if (app.name === "Convex Lens"){
	svg.select("#eye").style("visibility", "hidden");
	var convexLens2Bound = d3.select("#convex-lens2").node().getBoundingClientRect();
	svg.select("#convex-lens2").attr("transform", "translate(" + (xScale(0)-convexLens2Bound.width/2) + ", " + 0 + ")");
	var focus = 20;
	var focusData = [
		{x: null, y:null},
		{x: focus, y: 0},
		{x: -focus, y: 0}
	];
	svg.selectAll('circle').data(focusData).enter().append('circle').attr("cx", function(d){ return xScale(d.x); }).attr("cy", function(d){return yScale(d.y);}).attr("r", 3).attr('fill', '#000');
	// paramter option is what is known
	let extrapolateFocusLine = function(option, point = focus, yStart = yScale(0)){
		boundUpdate();
		let factor = (yScale(0) - (pencilBound.y - margin.top + window.scrollY))/(xScale(-focus) - (pencilBound.x - margin.right + window.scrollX));
		if (option.includes("x")){
			if (option.includes("bottom")){
				factor = ((pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY) - yScale(0))/(xScale(-focus) - (pencilBound.x - margin.right + window.scrollX));
					return yScale(0) - (factor * (xScale(0) - xScale(-focus)));
			}
			else {
				return yScale(0) + (factor * (xScale(0) - xScale(-focus)));
			}
		}
		else if (option.includes("y")){
			if (option.includes("bottom")){
				factor = ((pencilBound.y + pencilBound.height - 9 - margin.top + window.scrollY) - yScale(0))/(xScale(focus) - xScale(0));
				return (factor * (xScale(100) - xScale(point)) - yStart);
			}
			else {
				factor = (yScale(0) - (pencilBound.y - margin.top + window.scrollY))/(xScale(focus) - xScale(0));
				return yStart + (factor * (xScale(100) - xScale(point)));
			}
		}
	};
	let solidRayTop = function(){
		boundUpdate();
		if(pencilBound.x - margin.right + window.scrollX < xScale(-focus)){
			return [
				{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y - margin.top + window.scrollY},
				{x: xScale(0), y: pencilBound.y - margin.top + window.scrollY},
				{x: xScale(focus), y: yScale(0)},
				{x: xScale(100), y: extrapolateFocusLine("y")}
			];
		}
		else {
			return [
				{x: xScale(100), y: extrapolateFocusLine("x")},
				{x: xScale(0), y: extrapolateFocusLine("x")},
				{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y - margin.top + window.scrollY},
				{x: xScale(0), y: pencilBound.y - margin.top + window.scrollY},
				{x: xScale(focus), y: yScale(0)},
				{x: xScale(100), y: extrapolateFocusLine('y')}
			];
		}
	};
	let solidRayBottom = function(){
		boundUpdate();
		if(pencilBound.x - margin.right + window.scrollX < xScale(-focus)){
			return [
				{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
				{x: xScale(0), y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
				{x: xScale(focus), y: yScale(0)},
				{x: xScale(100), y: -extrapolateFocusLine("y bottom")}
			];
		}
		else {
			return [
				{x: xScale(100), y: extrapolateFocusLine("x bottom")},
				{x: xScale(0), y: extrapolateFocusLine("x bottom")},
				{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
				{x: xScale(0), y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
				{x: xScale(focus), y: yScale(0)},
				{x: xScale(100), y: -extrapolateFocusLine('y bottom')}
			];
		}
	};
	let rayFocus = function(){
		boundUpdate();
		return [
			{x: (pencilBound.x)-margin.right+window.scrollX, y: pencilBound.y-margin.top+window.scrollY},
			{x: xScale(-focus), y: yScale(0)},
			{x: xScale(0), y: extrapolateFocusLine("x")},
			{x: xScale(100), y: extrapolateFocusLine("x")}
		];
	};
	let rayFocusBottom = function(){
		boundUpdate();
		return [
			{x: pencilBound.x-margin.right+window.scrollX, y: pencilBound.y+pencilBound.height-margin.top-9+window.scrollY},
			{x: xScale(-focus), y: yScale(0)},
			{x: xScale(0), y: extrapolateFocusLine("x bottom")},
			{x: xScale(100), y: extrapolateFocusLine("x bottom")}
		];
	};
	let dashedLineTop = function(){
		boundUpdate();
		return [
			{x: xScale(0), y: extrapolateFocusLine("x")},
			{x: xScale(-100), y: extrapolateFocusLine('x')}
		];
	};
	let dashedLineBottom = function(){
		boundUpdate();
		return [
			{x: xScale(0), y: extrapolateFocusLine("x bottom")},
			{x: xScale(-100), y: extrapolateFocusLine('x bottom')}
		];
	};
	let dashedExtraTop = function(){
		boundUpdate();
		return [
			{x: xScale(0), y: pencilBound.y-margin.top+window.scrollY},
			{x: xScale(-100), y: 2*(pencilBound.y-margin.top+window.scrollY)-extrapolateFocusLine("y", 0, pencilBound.y-margin.top+window.scrollY)}
		];
	};
	let dashedExtraBottom = function(){
		boundUpdate();
		return [
			{x: xScale(0), y: pencilBound.y+pencilBound.height-9-margin.top+window.scrollY},
			{x: xScale(-100), y: extrapolateFocusLine("y bottom", 0, pencilBound.y+pencilBound.height-9-margin.top+window.scrollY-2*(pencilBound.y+pencilBound.height-9-margin.top+window.scrollY))}
		];
	};
	let line = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;});
	svg.append("path").attr("d", line(solidRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "solidRayTop");
	svg.append("path").attr("d", line(rayFocus())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "rayFocus");
	svg.append("path").attr("d", line(solidRayBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "solidRayBottom");
	svg.append('path').attr("d", line(rayFocusBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "rayFocusBottom");
	svg.append("path").attr("d", line(dashedLineTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "dashedLineTop").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
	svg.append("path").attr("d", line(dashedLineBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "dashedLineBottom").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
	svg.append("path").attr('d', line(dashedExtraTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "dashedExtraTop").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
	svg.append("path").attr('d', line(dashedExtraBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "dashedExtraBottom").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
	boundUpdate();
	let objectImageScale = function(){
		// doing math rip
		boundUpdate();
		let f = xScale(0) - xScale(-focus);
		let d0 = xScale(0) - (pencilBound.x - margin.right - window.scrollX);
		let di = 1/((1/f)-(1/d0));
		let h = extrapolateFocusLine("x")-extrapolateFocusLine("x bottom");
		let imageScale = h/pencilBound.height;
		// svg.append('path').attr("d", "M"+(xScale(0)+di)+","+extrapolateFocusLine("x")+"v"+(-h)).attr("stroke", "red").attr("stroke-width", 5).attr("class", "test2");
		// d3.select("#object-image").attr("transform", "rotate(180," + imageBound.width/2 + "," + imageBound.height/2 + ") scale("+imageScale+") translate(" + (-(xScale(0)+di)/imageScale) + ", " + ((h-extrapolateFocusLine("x"))/imageScale) + ")");
		if (pencilBound.x-margin.right+window.scrollX > xScale(-focus)){
			d3.select("#object-image").attr("transform", "rotate(180) scale("+imageScale+") translate(" + (-(xScale(0)+di-imageBound.width)/imageScale) + ", " + ((-extrapolateFocusLine("x"))/imageScale) + ")");
		}
		else {
			d3.select("#object-image").attr("transform", "rotate(180) scale("+imageScale+") translate(" + (-(xScale(0)+di+imageBound.width)/imageScale) + ", " + ((-extrapolateFocusLine("x"))/imageScale) + ")");
		}
	};
	objectImageScale();
	// line to test di
	// svg.append('path').attr("d", "M"+xScale(0)+","+yScale(0)+"h"+objectImageScale()).attr("stroke", "black").attr("stroke-width", 5).attr("class", "test");
	var convexLensDrag = d3.drag().on("start", dragstarted).on("drag", dragmove);
	d3.select("#object").call(convexLensDrag);
	function dragstarted(){
		// redraws the object to be on top
		d3.select(this).raise();
	}
	function dragmove(){
		// gets the bounding rectangle so we can find the center
		let bound = this.getBoundingClientRect();
		var x = d3.event.x - (bound.width/2);
		var y = d3.event.y - (bound.height/2);
		d3.select(this).attr("transform", "translate("+(Math.min(x, xScale(0)-bound.width))+","+y+")");
		// svg.select("#object-image").attr("transform", "translate("+(Math.max(xScale(0), xScale(100)-d3.event.x-bound.width/2))+","+(y)+")");
		if (bound.x-margin.right+window.scrollX >= xScale(-focus)-1 && bound.x-margin.right+window.scrollX <= xScale(-focus)+1){
			return;
		}
		else {
			d3.selectAll(".solidRayTop").attr("d", line(solidRayTop()));
			d3.select(".rayFocus").attr("d", line(rayFocus()));
			d3.select(".solidRayBottom").attr("d", line(solidRayBottom()));
			d3.select(".rayFocusBottom").attr("d", line(rayFocusBottom()));
			d3.select('.dashedLineTop').attr("d", line(dashedLineTop()));
			d3.select('.dashedLineBottom').attr("d", line(dashedLineBottom()));
			d3.select(".dashedExtraTop").attr("d", line(dashedExtraTop()));
			d3.select(".dashedExtraBottom").attr("d", line(dashedExtraBottom()));
			d3.select(".dashedLineTop").attr("visibility", "hidden");
			d3.select(".dashedLineBottom").attr("visibility", "hidden");
			d3.select(".dashedExtraTop").attr("visibility", "hidden");
			d3.select(".dashedExtraBottom").attr("visibility", "hidden");
			// d3.select(".test").attr("d", "M"+xScale(0)+","+yScale(0)+"h"+objectImageScale()).attr("stroke", "black").attr("stroke-width", 5);
			objectImageScale();
			if (bound.x-margin.right+window.scrollX > xScale(-focus)){
				d3.select(".rayFocus").attr("stroke-dasharray", "5 10");
				d3.select('.rayFocusBottom').attr("stroke-dasharray", "5 10");
				d3.select(".dashedLineTop").attr("visibility", "visible");
				d3.select(".dashedLineBottom").attr("visibility", "visible");
				d3.select(".dashedExtraTop").attr("visibility", "visible");
				d3.select(".dashedExtraBottom").attr("visibility", "visible");
			}
			else {
				d3.select(".rayFocus").attr("stroke-dasharray", "none");
				d3.select(".rayFocusBottom").attr("stroke-dasharray", "none");
			}
		}
	}
}
function boundUpdate(){
	pencilBound = d3.select("#object").node().getBoundingClientRect();
	eyeBound = d3.select("#eye").node().getBoundingClientRect();
	imageBound = d3.select("#object-image").node().getBoundingClientRect();
	return [pencilBound, eyeBound, imageBound];
}