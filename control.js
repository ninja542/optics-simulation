// margins
var margin = { top: 40, right: 40, bottom: 40, left: 40 },
		width = 1000 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;
// x axis scaling stuff
var xScale = d3.scaleLinear().domain([-100, 100]).range([0, width]);
var xAxis = d3.axisBottom(xScale);
// y axis scaling stuff
var yScale = d3.scaleLinear().domain([100, -100]).range([0, height]);
var yAxis = d3.axisLeft(yScale);
function graphSetup(){
	var svg = d3.select('.simulation')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.select('#transform')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	// make the axes
	svg.append("g").call(xAxis).attr("transform", "translate(" + 0 + ", " + yScale(0) + ")");
	svg.append("g").call(yAxis).attr("transform", "translate(" + xScale(0) + ", " + 0 + ")");
}
var svg = d3.select("#transform");

var app = new Vue({
	el: '#wrapper',
	data: {
		name: "Convex Lens"
	},
	watch: {
		name: function() {
			if (name == "Convex Lens"){

			}
		}
	},
	methods: {

	},
	mounted: function(){
		graphSetup();
	}
});
var planeMirror = new Vue({
	el: "#planemirror",
	mounted: function(){
		// variable thing to get the circle drag to work
		var circleEye = [
				{x: 0, y: 0}
		];
		// make the circle
		var eye = d3.select("#planemirror").selectAll("circle").data(circleEye).enter().append('circle')
				.attr('cx', function(d){ return d.x; })
				.attr('cy', function(d){ return d.y; })
				.attr('r', 10)
				.style('fill', '#000')
				.attr("id", "eye");

		d3.select("#eye").attr("transform", "translate(" + xScale(-40) + ", " + yScale(40) + ")");
	}
});
var convexLens = new Vue({
	el: "#convexlens",
	data: {
		focus: 20
	},
	methods: {
		boundUpdate: function(){
			pencilBound = d3.select("#convexlens #object").node().getBoundingClientRect();
			imageBound = d3.select("#convexlens #object-image").node().getBoundingClientRect();
			return [pencilBound, imageBound];
		},
		extrapolateFocusLine: function(option, point = focus, yStart = yScale(0)){
			this.boundUpdate();
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
		},
		solidRayTop: function(){
			this.boundUpdate();
			if(pencilBound.x - margin.right + window.scrollX < xScale(-focus)){
				return [
					{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y - margin.top + window.scrollY},
					{x: xScale(0), y: pencilBound.y - margin.top + window.scrollY},
					{x: xScale(focus), y: yScale(0)},
					{x: xScale(100), y: this.extrapolateFocusLine("y")}
				];
			}
			else {
				return [
					{x: xScale(100), y: this.extrapolateFocusLine("x")},
					{x: xScale(0), y: this.extrapolateFocusLine("x")},
					{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y - margin.top + window.scrollY},
					{x: xScale(0), y: pencilBound.y - margin.top + window.scrollY},
					{x: xScale(focus), y: yScale(0)},
					{x: xScale(100), y: this.extrapolateFocusLine('y')}
				];
			}
		},
		solidRayBottom: function(){
			this.this.boundUpdate();
			if(pencilBound.x - margin.right + window.scrollX < xScale(-focus)){
				return [
					{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
					{x: xScale(0), y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
					{x: xScale(focus), y: yScale(0)},
					{x: xScale(100), y: -this.extrapolateFocusLine("y bottom")}
				];
			}
			else {
				return [
					{x: xScale(100), y: this.extrapolateFocusLine("x bottom")},
					{x: xScale(0), y: this.extrapolateFocusLine("x bottom")},
					{x: pencilBound.x - margin.right + window.scrollX, y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
					{x: xScale(0), y: pencilBound.y + pencilBound.height - margin.top - 9 + window.scrollY},
					{x: xScale(focus), y: yScale(0)},
					{x: xScale(100), y: -this.extrapolateFocusLine('y bottom')}
				];
			}
		},
		rayFocus: function(){
			this.boundUpdate();
			return [
				{x: (pencilBound.x)-margin.right+window.scrollX, y: pencilBound.y-margin.top+window.scrollY},
				{x: xScale(-focus), y: yScale(0)},
				{x: xScale(0), y: this.extrapolateFocusLine("x")},
				{x: xScale(100), y: this.extrapolateFocusLine("x")}
			];
		},
		rayFocusBottom: function(){
			this.boundUpdate();
			return [
				{x: pencilBound.x-margin.right+window.scrollX, y: pencilBound.y+pencilBound.height-margin.top-9+window.scrollY},
				{x: xScale(-focus), y: yScale(0)},
				{x: xScale(0), y: this.extrapolateFocusLine("x bottom")},
				{x: xScale(100), y: this.extrapolateFocusLine("x bottom")}
			];
		},
		dashedLineTop: function(){
			this.boundUpdate();
			return [
				{x: xScale(0), y: this.extrapolateFocusLine("x")},
				{x: xScale(-100), y: this.extrapolateFocusLine('x')}
			];
		},
		dashedLineBottom: function(){
			this.boundUpdate();
			return [
				{x: xScale(0), y: this.extrapolateFocusLine("x bottom")},
				{x: xScale(-100), y: this.extrapolateFocusLine('x bottom')}
			];
		},
		dashedExtraTop: function(){
			this.boundUpdate();
			return [
				{x: xScale(0), y: pencilBound.y-margin.top+window.scrollY},
				{x: xScale(-100), y: 2*(pencilBound.y-margin.top+window.scrollY)-this.extrapolateFocusLine("y", 0, pencilBound.y-margin.top+window.scrollY)}
			];
		},
		dashedExtraBottom: function(){
			this.boundUpdate();
			return [
				{x: xScale(0), y: pencilBound.y+pencilBound.height-9-margin.top+window.scrollY},
				{x: xScale(-100), y: this.extrapolateFocusLine("y bottom", 0, pencilBound.y+pencilBound.height-9-margin.top+window.scrollY-2*(pencilBound.y+pencilBound.height-9-margin.top+window.scrollY))}
			];
		},
		drawLines: function(){
			let line = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;});
			svg.append("path").attr("d", line(this.solidRayTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "solidRayTop");
			svg.append("path").attr("d", line(this.rayFocus())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "rayFocus");
			svg.append("path").attr("d", line(this.solidRayBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "solidRayBottom");
			svg.append('path').attr("d", line(this.rayFocusBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "rayFocusBottom");
			svg.append("path").attr("d", line(this.dashedLineTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "dashedLineTop").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
			svg.append("path").attr("d", line(this.dashedLineBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "dashedLineBottom").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
			svg.append("path").attr('d', line(this.dashedExtraTop())).attr("stroke-width", 1).attr("stroke", "black").attr("fill", "none").attr("class", "dashedExtraTop").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
			svg.append("path").attr('d', line(this.dashedExtraBottom())).attr("stroke-width", 1).attr("stroke", "red").attr("fill", "none").attr("class", "dashedExtraBottom").attr("stroke-dasharray", "5 10").attr("visibility", "hidden");
		},
		update: function(){
			d3.select("#object-image").attr("transform", "rotate(180," + imageBound.width/2 + "," + imageBound.height/2 + ") scale("+imageScale+") translate(" + (-(xScale(0)+di)/imageScale) + ", " + ((h-extrapolateFocusLine("x"))/imageScale) + ")");
		}
	},
	mounted: function(){
		var convexLensBound = d3.select("#convex-lens2").node().getBoundingClientRect();
		d3.select("#convex-lens2").attr("transform", "translate(" + (xScale(0)-convexLensBound.width/2) + ", " + 0 + ")");
		var focusData = [
			{x: this.focus, y: 0},
			{x: -this.focus, y: 0}
		];
		d3.select("#convexlens").selectAll('circle').data(focusData).enter().append('circle').attr("cx", function(d){ return xScale(d.x); }).attr("cy", function(d){return yScale(d.y);}).attr("r", 3).attr('fill', '#000');
	}
});