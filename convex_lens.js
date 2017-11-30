var convexLensBound = d3.select("#convex-lens2").node().getBoundingClientRect();
svg.select("#convex-lens2").attr("transform", "translate(" + (xScale(0)-convexLensBound.width/2) + ", " + 0 + ")");
var focus = 20;
var focusData = [
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
	return di+window.scrollX;
};
let objectScalePosition = function(){
	boundUpdate();
	let f = xScale(0) - xScale(-focus);
	let d0 = xScale(0) - (pencilBound.x - margin.right - window.scrollX);
	let di = 1/((1/f)-(1/d0));
	let h = extrapolateFocusLine("x")-extrapolateFocusLine("x bottom");
	let imageScale = h/pencilBound.height;
	d3.select("#object-image").attr("transform", "rotate(180," + imageBound.width/2 + "," + imageBound.height/2 + ") scale("+imageScale+") translate(" + (-(xScale(0)+di+window.scrollX)/imageScale) + ", " + ((h-extrapolateFocusLine("x"))/imageScale) + ")");
	return [imageScale, di+window.scrollX];
};
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
function boundUpdate(){
	pencilBound = d3.select("#object").node().getBoundingClientRect();
	eyeBound = d3.select("#eye").node().getBoundingClientRect();
	imageBound = d3.select("#object-image").node().getBoundingClientRect();
	return [pencilBound, eyeBound, imageBound];
}