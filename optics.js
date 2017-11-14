// margins
var margin = { top: 40, right: 40, bottom: 40, left: 40 },
		width = 1000 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;
var svg = d3.select('#simulation')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
	.select('#transform')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// implement stupid graph
// x axis scaling stuff
var xScale = d3.scaleLinear().domain([-100, 100]).range([0, width]);
var xAxis = d3.axisBottom(xScale);
// y axis scaling stuff
var yScale = d3.scaleLinear().domain([100, -100]).range([0, height]);
var yAxis = d3.axisLeft(yScale);
// make the axes
svg.append("g").call(xAxis).attr("transform", "translate(" + 0 + ", " + yScale(0) + ")");
svg.append("g").call(yAxis).attr("transform", "translate(" + xScale(0) + ", " + 0 + ")");
// note: need to add gridlines.

// variable thing to get the circle drag to work
var circleEye = [
		{x: 0, y: 0}
];
// make the circle
var eye = svg.selectAll("circle").data(circleEye).enter().append('circle')
		.attr('cx', function(d){return d.x;})
		.attr('cy', function(d){return d.y;})
		.attr('r', 10)
		.style('fill', '#000')
		.attr("id", "eye");

// variables for getting center of mirror, object, etc
var mirrorBound = d3.select('#mirror').node().getBoundingClientRect();
var pencilBound = d3.select("#object").node().getBoundingClientRect();
var eyeBound = d3.select("#eye").node().getBoundingClientRect();
var convexLens2Bound = d3.select("#convex-lens2").node().getBoundingClientRect();

// positioning things at the start
d3.select("#mirror").attr("transform", "translate(" + (xScale(0)) + ", " + (yScale(0)-mirrorBound.height/2) + ")");
d3.select("#object").attr("transform", "translate("+(xScale(-20)-pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");
d3.select("#eye").attr("transform", "translate(" + xScale(-40) + ", " + yScale(40) + ")");
svg.select("#object-image").attr("transform", "translate("+(xScale(20)-pencilBound.width/2)+","+(yScale(0)-pencilBound.height/2)+")");
svg.select("#convex-lens2").attr("transform", "translate(" + (xScale(0)-convexLens2Bound.width/2) + ", " + 0 + ")");

// ray tracing code
function solidRayTop(){
	//update object bounds
	eyeBound = d3.select("#eye").node().getBoundingClientRect();
	pencilBound = d3.select("#object").node().getBoundingClientRect();
	// plane mirror ray tracing
	return [
			{x: eyeBound.x-margin.right, y: eyeBound.y-margin.top+window.scrollY},
			{x: xScale(0), y: equalAngleHeight(eyeBound, pencilBound, pencilBound.y)},
			{x: (pencilBound.x-pencilBound.width/2)-margin.right, y: pencilBound.y-margin.top+window.scrollY}
	];
}
function dashedRayTop(){
	var imageBound = d3.select("#object-image").node().getBoundingClientRect();
	return [solidRayTop()[1], {x: imageBound.x-margin.left, y: imageBound.y-margin.top+window.scrollY}];
}
function dashedRayBottom(){
	var imageBound = d3.select("#object-image").node().getBoundingClientRect();
	return [solidRayBottom()[1], {x: imageBound.x-margin.left, y: imageBound.y+imageBound.height-margin.top-8+window.scrollY}];
}
// need to fix positioning soon tomorrow then I can finally move on to curved mirrors
function solidRayBottom(){
	eyeBound = d3.select("#eye").node().getBoundingClientRect();
	pencilBound = d3.select("#object").node().getBoundingClientRect();
	return [
			{x: eyeBound.x-margin.right, y: eyeBound.y-margin.top+window.scrollY},
			{x: xScale(0), y: equalAngleHeight(eyeBound, pencilBound, pencilBound.y+pencilBound.height)},
			{x: (pencilBound.x-pencilBound.width/2)-margin.right, y: pencilBound.y+pencilBound.height-margin.top-8+window.scrollY}
	];
}
// calculate the correct angle and height stuff
function equalAngleHeight(eyeBound, pencilBound, pencilY){
	var x1 = xScale(0)-eyeBound.x+margin.right;
	var x2 = xScale(0)-pencilBound.right+margin.right;
	// y coordinate of eye * x1 + y coord of pencil * x2 = mystery y coord(x1 + x2)
	var y1 = eyeBound.y-margin.top+window.scrollY;
	var y2 = pencilY-margin.top+window.scrollY;
	return (y2 * x1 + y1 * x2)/(x1 + x2);
}

//drawing the lines
var line = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;});
svg.append("path").attr("d", line(solidRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "solidRayTop");
svg.append("path").attr("d", line(dashedRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("stroke-dasharray", "5, 10").attr("class", "dashedRayTop");
svg.append("path").attr("d", line(solidRayBottom())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "solidRayBottom");
svg.append("path").attr("d", line(dashedRayBottom())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("stroke-dasharray", "5, 10").attr("class", "dashedRayBottom");

// general drag code for non circle things
var mirrorDrag = d3.drag().on("start", dragstarted).on("drag", dragmove);
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
		d3.select(this).attr("transform", "translate("+x+","+y+")");
		svg.select("#object-image").attr("transform", "translate("+(xScale(100)-d3.event.x-bound.width/2)+","+(y)+")");
		d3.select(".solidRayTop").attr("d", line(solidRayTop()));
		d3.select(".dashedRayTop").attr("d", line(dashedRayTop()));
		d3.select(".solidRayBottom").attr("d", line(solidRayBottom()));
		d3.select(".dashedRayBottom").attr("d", line(dashedRayBottom()));
}
// call the circle and drag it
eye.call(d3.drag().on("drag", circledrag));
// set the x and y attributes to the same as the dragging
function circledrag(d){
		d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
		d3.select(".solidRayTop").attr("d", line(solidRayTop()));
		d3.select(".dashedRayTop").attr("d", line(dashedRayTop()));
		d3.select(".solidRayBottom").attr("d", line(solidRayBottom()));
		d3.select(".dashedRayBottom").attr("d", line(dashedRayBottom()));
}