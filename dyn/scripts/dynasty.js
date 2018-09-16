/*Put all dynasty mode specific code here*/
function getMode(){
	return "dynasty";
}

function showDynasty(){
}

function modeInit(){
	$("#DynastyHeader").text("Dynasty");
}	

function generateRiversRandomly(amount){
	amount = Math.min(riverSources.length,amount);
	for(var i = amount; i--; ){
		var gP = riverSources[i];
		var startTile = world.tiles[gP.x][gP.y];
		var riverLength = random(15,30);
		generateRiverFrom(startTile,riverLength);
		//measureDepth(); // soooo costly
	}
	measureDepth();
}
var rivers = [];
function generateRiverFrom(start,riverLength){

	goal = world.tiles[0][0]; //ignore
	goalCond = function(node){
		return (node.type == "water");
	}
	distanceFunc = function(node1,node2){
		if(node2.type == "water") return 1;
		if(node1.type == node2.type){
			if(node1.depth > node2.depth){
				return 100;
			}
			else if(node1.depth == node2.depth){
				if(node1.type == "mountain")
					return 20;
				return 5;
			}
			else{
				return 2;
			}
		}
		else if(node1.type == "mountain" && (node2.type == "grass" || node2.type == "forest")){
			return 2;
		}
		else if((node1.type == "grass" || node1.type == "forest") && node2.type == "mountain"){
			return Infinity;
		}
		else if((node1.type == "grass" || node1.type == "forest") && node2.type == "sand"){
			return 2;
		}
		else{
			return 100;
		}
	}
	function heuristicFunc(node,goal){
		return node.depth;
	}
	function returnFunc(end,goal){
		var path = [end];
		while(end.cameFrom !== undefined){
			path.push(end.cameFrom);
			end.type = "water";
			end.depth = 1;
			end.river = true;
			end = end.cameFrom;
			if(end == start) break;
		}
		rivers.push(path);
		lastSeason = -1;
		console.log("Generated river of length " + path.length + " , there are now " + rivers.length + " rivers");
		return path;
	}
	function failFunc(){
		console.log("Failed to generate a river");
		return null;
	}
	return heapAStar(start,goal,goalCond,distanceFunc,heuristicFunc,returnFunc,failFunc);
}

var roads = [];

function generateRoadTo(start,goal,maxLength){
	var goalCond;
	var distanceFunc;
	var heuristicFunc;
	var returnFunc;
	var failFunc;
	goalCond = function(node){
		/*if(!!node.road){
			if(roads[node.roadIndex].to == goal || roads[node.roadIndex].from == goal)
				return true;
		}*/
		return (node == goal);
	};
	distanceFunc = distanceBetween;
	heuristicFunc = heuristic;
	returnFunc = function(end){
		var path = [end];
		while(end.cameFrom !== undefined){
			path.push(end.cameFrom);
			end.road = true;
			end.roadIndex = roads.length;
			end = end.cameFrom;
			if(end == start) break;
		}
		var road = {"path" : path, "from" : start, "to" : goal};
		roads.push(road);
		return path;
	};
	failFunc = function(){return null;};
	return heapAStar(start,goal,goalCond,distanceFunc,heuristicFunc,returnFunc,failFunc,maxLength);
}

function generateRoads(){
	//for now I'm just picking cities at random...

	var i;
	var abandon = 0;
	for(i = 0; i < cities.length-1; i++){
		var start = cities[i].tiles[0];
		var x1 = start.globalPosition.x;
		var y1 = start.globalPosition.y;
		var goal = cities[(i + 1) % cities.length].tiles[0];
		var x2 = goal.globalPosition.x;
		var y2 = goal.globalPosition.y;
		
		console.log("    Working on road " + i + " from ("+x1+","+y1+") to ("+x2+","+y2+")");
		if(heuristic(start,goal) < 100)
			generateRoadTo(start,goal,1000);
		else{
			console.log("    Abandoned work on road, as it was deemed too expensive");
			abandon++;
		}
	}
	console.log("    Generated " + (i - abandon) + " roads")
	lastSeason = -1;
}

function drawPlates(){
	canvas = $("#canvas")[0];
	cctx = canvas.getContext("2d");
	
	for(var i = 0; i < plates.length; i++){
		var scale = (i * 256) / plates.length;
		cctx.fillStyle = "rgba("+scale+", "+scale+", "+scale+",0.5)";
		var plate = plates[i];
        var minX = plate.minX*world.tileSize;
        var maxX = plate.maxX*world.tileSize;
        var minY = plate.minY*world.tileSize;
        var maxY = plate.maxY*world.tileSize;
		cctx.fillRect(minX,minY,maxX-minX,maxY-minY);
	}
}

function Plate(minX, maxX, minY, maxY){
	this.minX = minX;
	this.maxX = maxX;
	this.minY = minY;
	this.maxY = maxY;
	this.area = (maxX-minX) * (maxY-minY);
	this.moveX = 0;
	this.moveY = 0;
}

var  plates = [];
var minEdge = 0;
var maxEdge = 0;
function ytg(sizeX, sizeY){
	sizeX = Math.floor(sizeX);
	sizeY = Math.floor(sizeY);
	var size = sizeX * sizeY;
	var temp = [];
	follow = temp;
	var randomN;
	var sources = [];
	for(var y = 0; y < sizeY; y++){ //iteration 1
		for(var x = 0; x < sizeX; x++){
			var type = "grass";
			if(y == 0){
				temp[x] = [];
			}
			var edge = random(minEdge,maxEdge);
			if(x < edge || x > sizeX - edge || y < edge || y > sizeY - edge){
				type = "water";
			}
			temp[x][y] = new Tile({x:x,y:y}, type, []);

			//find neighbours
			var tile = temp[x][y];
			tile.neighbours = [];
			for(nX = -1; nX < 2; nX++){
				for(nY = 1; nY > -2; nY--){ 		
					cX = x + nX;
					cY = y + nY;
					if((nY == 0 && nX == 0) || cX < 0 || cY < 0 || cX >= sizeX || cY >= sizeY){
						continue; //out of bounds
					}
					else{
						tile.neighbours.push([cX,cY]);
					}
				}
			}
		}
	}

    var nrPlates = 7; //seven is always a good number



    //generate Plates

    plates.push(new Plate(0, sizeX-1, 0, sizeY-1));
    sources = [];
    for (var i = nrPlates; i--;) {
    	var nr;

    	//choose "randomly"

    	var r = random(0,size);
    	var plate;
    	for(var n = 0; n < plates.length; n++){
    		plate = plates[n];
    		r -= plate.area;
    		if(r < 0){
    			break;
    		}
    	}
//        var plate = plates[nr]; // pick a plate
        var minX = plate.minX;
        var maxX = plate.maxX;
        var minY = plate.minY;
        var maxY = plate.maxY;
        var split = random(0, maxY-minY+maxX-minX);
        var newX = 0;
        var newY = 0;
        if (maxY-minY < maxX - minX) { //split on x
            maxX = minX + Math.round((random(1, 9) * (maxX - minX)) / 10);

            newX = maxX;
            newY = random(minY, maxY);

        	plates.push(new Plate(maxX, plate.maxX+0, minY, maxY));

        } else { //split on y
            maxY = minY +  Math.round((random(1, 9) * (maxY - minY)) / 10);

            newX = random(minX, maxX);
            newY = maxY;

        	plates.push(new Plate(minX, maxX, maxY, plate.maxY+0));
        }

        temp[newX][newY].type = "mountain";
        
        sources.push({
            x: newX,
            y: newY
        });
        plate.minX = minX;
        plate.maxX = maxX;
        plate.minY = minY;
        plate.maxY = maxY;
        plate.area = (maxX - minX) * (maxY - minY);
    }

    for (var k = 0; k < 4; k++) {

        x = (k % 4 === 0) ? 0: sizeX-1;
        y = (k % 4 === 1) ? 0: sizeY-1;

        if (k & 1) {
            y = random(0, sizeY-1);
        } else {
            x = random(0, sizeX-1);
        }
        temp[x][y].type = "water";
        sources.push({
            x: x,
            y: y
        });
    }

    // other sources. right now just forests.
    var keys = Object.keys(mapRules);
	for(var i = 0; i< tileTypes.length;i++) 
	{
		if(tileTypes[i] != "forest") continue;
		var type = tileTypes[i];
		var averageSize = 1+size*((mapRules[tileTypes[i]]["size"]["min"] + mapRules[tileTypes[i]]["size"]["max"])/2);
		var amount = Math.round((mapRules[tileTypes[i]]["freq"]*size)/averageSize);
		print("amount of " + tileTypes[i] + " sources is " + amount)
		for(var k = 0; k < amount; k++){
			lowestAllowedDistanceST = 50;//size*0.001;
			lowestAllowedDistanceDT = 20;//size*0.0001;
			var stopLooping = false;
			var x,y;
			while(!stopLooping){
				x = random(0,sizeX-1);
				y = random(0,sizeY-1);
				stopLooping = true;
				for(var n = 0; n < sources.length; n++){
					var distance = Math.sqrt(Math.pow(sources[n].x-x,2) + Math.pow(sources[n].y-y,2));
					if(distance < lowestAllowedDistanceST && temp[sources[n].x][sources[n].y].type == tileTypes[i]){
						stopLooping = false;
					}
					else if(distance < lowestAllowedDistanceDT){
						stopLooping = false;
					}
				}
			}
			temp[x][y].type = tileTypes[i];
			sources.push({x:x,y:y});
		}
	}
	
	waterTiles = 0;
	placed = 0;
	for(var i = 0; i < sources.length; i++){
		var origin = {x:sources[i].x, y:sources[i].y}
		var direction, x, y;
		x = origin.x;
		y = origin.y;
		var type = temp[origin.x][origin.y].type;
		var amountLeft = random(Math.round(size*mapRules[type]["size"]["min"]),Math.round(size*mapRules[type]["size"]["max"]));
		amountLeft = Math.round(size*((mapRules[type]["size"]["min"] + mapRules[type]["size"]["max"])/2));
		var shouldPlace;
		if(type == "water"){
			waterTiles += amountLeft;
			shouldPlace = amountLeft;
		}
		var errorsInARow = 0;
		while(amountLeft > 1 && errorsInARow < 200){
			if(errorsInARow == -1 && random(0,100) > 75){
				x+= direction;
				y+= direction;
			}
			else{
			direction = random(-1,1);//Math.floor(Math.random()*3) - 1;
			x += direction;
			direction = random(-1,1);//Math.floor(Math.random()*3) - 1;
			y += direction;
			}
			if(x < 0 || x >= sizeX || y < 0 || y >= sizeY || temp[x][y].type != "grass" ){
				x = origin.x + random(-10,10);
				y = origin.y + random(-10,10);
				errorsInARow++;
			}
			else{
				if(random(0,100) > 91){	
					origin.x = x;
					origin.y = y;
					
				}
				temp[x][y].type = type;
				amountLeft--;
				errorsInARow = -1;
			}
		}
		if(type == "water"){
		placed += shouldPlace - amountLeft;
		}
	}
	
	return temp;
}

function beautify(temp, times){
	var sizeX = world.sizeX;
	var sizeY = world.sizeY;
	for(var twice = 0; twice < times; twice++){
		for(var y = 0; y < sizeY; y++){
			for(var x = 0; x < sizeX; x++){
				//count neighbours
				var tile = temp[x][y];
				var sameType = 0;
				var types = {grass:0, water:0, mountain:0, forest:0, sand:0};
				for(nX = -1; nX < 2; nX++){
					for(nY = 1; nY > -2; nY--){ 		
						cX = x + nX;
						cY = y + nY;
						if((nY == 0 && nX == 0) || cX < 0 || cY < 0 || cX >= sizeX || cY >= sizeY){
							continue; //out of bounds
						}
						else{
						//	tile.neighbours.push(temp[cX][cY]);
							var nType = temp[cX][cY].type
							if(nType == tile.type){
								sameType++;
							}
							types[nType]++;
						}
					}
				}
				if(sameType < 3){
					mostOf = {type:"grass", amount:types['grass']};
					if(types["water"] > mostOf.amount){
						mostOf = {type:"water", amount:types['water']};	
					}
					if(types["mountain"] > mostOf.amount){
						mostOf = {type:"mountain", amount:types['mountain']};	
					}
					if(types["forest"] > mostOf.amount){
						mostOf = {type:"forest", amount:types['forest']};	
					}
					tile.type = mostOf.type;
				}
				if(types['water'] > 2 && tile.type != "water" && (random(5) > 2)){
					tile.type = "sand";	
				}
				if(types['mountain'] > 0 && tile.type == "water" && (random(6) > 2)){
					tile.type = "grass";	
				}
			}
		}
	}
	return temp;
}

function craftNewWorld(tilesize, seed, times){
	var worker = new Worker('scripts/mapGenerator.js');
	worker.addEventListener('message', function(event) {
		if(event.data[0] == "{")
			{
				world = JSON.parse(event.data);
				delete(event.data);
				delete(event);
				world.tileSize = tileSize;
				$("#newPlayer").show();
				$("#progress").hide();
				stopLoading();
				drawWorld3(world);
			}
		else{
 			console.log(event.data);
 			$("#progress").text(event.data);
 		}
	}	, false);
	worker.postMessage({"sizeX":world.sizeX,"sizeY":world.sizeY,"mapRules":mapRules,"m":m, "name":name}); // send params
	$("#progress").show();
}

var undo;
function test(times){
	undo = world;
	areas = {};
	people = [];
	world.tiles = beautify(remember, times);
	measureDepth(world,0,false);//,1,true); //needs tiles to measure
	generateResources();		//needs depth from measureDepth
	determineValue();			//needs resources from generateResources
	generatePopulation(); 		//needs values from determineValue
//	checkAreas();				//needs settlements from generatePopulation
//	var player = allPeople[random(0,allPeople.length-1)]; //new generatePerson(); //needs areas to pick a city at random.
//	createDynasty(player); //move these to newGame()
	generateRoads();
	drawWorld3();
}


var cultures = [];
var culture = 0;
function cultureTest(){
	cultures.push([cities[0]]);
	for(var i = 0; i < cities.length-1; i++){
		var tile = cities[i].tiles[0];
		if(tile.road){
			var road = roads[tile.roadIndex];
			console.log("Road " + i + " is " + road.path.length);
			if(road.path.length > 100){
				culture++;
				cultures[culture] = [cities[i+1]];
			}
			else{
				cultures[culture].push(cities[i+1]);
			}
		}
		else{
			culture++;
			cultures[culture] = [cities[i+1]];
		}
	}
	console.log(cities.length + " => " + cultures);
}

function generateCultures(){
	cultures = [];
	analyseCities();
	cultures = findCultures(Math.round(cities.length / 4));
}

function findCultures(amount){
	var clusterCentra = [];
	var clusters = [];
	var hasChanged = true;

	for(var i = 0; i < cities.length; i++){
		if(i % amount == 0){
			clusterCentra.push(cities[i].center);
			clusters.push([]);
		}
		cities[i].cultureID = -1;
	}
	
	while(hasChanged){
		hasChanged = false;
		for(var i = 0; i < cities.length; i++){
			var minDistance = Infinity;
			var cluster = 0;
			for(var k = 0; k < clusterCentra.length; k++){
				var distance = euclideanDistance(clusterCentra[k], cities[i].center);
				if(distance < minDistance){
					minDistance = distance;
					cluster = k;
				}
			}
			if(cities[i].cultureID != culture){
				hasChanged = true;
				clusters[cluster].push(cities[i]);
				if(cities[i].cultureID !== -1){
					var index = member(cities[i], clusters[cities[i].cultureID]); //temporary solution
					cultures[cities[i].cultureID].splice(index, 1); 
				}
				cities[i].cultureID = culture;
			}	
		}
		if(!hasChanged) break;
		for(var i  = 0; i < clusters.length; i++){
			var xTot = 0;
			var yTot = 0;
				
			for(var k = 0; k < clusters[i].length; k++){
				var x = clusters[i][k].center.x;
				var y = clusters[i][k].center.y;
				xTot += x;
				yTot += y;				
			}
			var xMean = xTot / clusters[i].length;	
			var yMean = yTot / clusters[i].length;
			clusterCentra[i] = {"x":xMean,"y":yMean};
		}
	}
	return clusters;
}

function selectCulture(culture){
	for(var x = 0; x < world.tiles.length; x++)
		for(var y = 0; y < world.tiles[0].length; y++){
			world.tiles[x][y].selected = false;
		};
	for(var k = 0; k < culture.length; k++){
		for(var n = 0; n < culture[k].tiles.length; n++){
			culture[k].tiles[n].selected = true;
		}
	}
	repaint2(world);
}

function analyseCities(){
	//adds population
	//adds center
	//adds radius
	for(var i = 0; i < cities.length; i++){
		var city = cities[i];
		var pop = 0;
		var xTot = 0;
		var yTot = 0;
		var xMin = Infinity;
		var xMax = -1;
		var yMin = Infinity;
		var yMax = -1;
		for(var k = 0; k < city.tiles.length; k++){
			if(city.tiles[k].population !== undefined) pop += city.tiles[k].population;
			var x = city.tiles[k].globalPosition.x;
			var y = city.tiles[k].globalPosition.y;
			xTot += x;
			yTot += y;
			if(x < xMin){ xMin = x; }
			if(x > xMax){ xMax = x; }
			if(y < yMin){ yMin = y; }
			if(y > xMax){ yMax = y; }
		}
		city.population = pop;
		var xMean = xTot / city.tiles.length;
		var yMean = yTot / city.tiles.length;
		var radius = Math.max ((xMean - xMin), (yMean - yMin), (xMax - xMean), (yMax - yMean));
		city.center = {"x":xMean,"y":yMean};
		city.radius = radius;
	}
}

function drawCultures(start,end){
	for(var i = start; i < end; i++){
		var color = getRandomColor(i,end-start,0.7);
		console.log("drawing culture with color "+color);
		cctx.fillStyle = color;
		cctx.beginPath();
		cctx.moveTo(cultures[i][0].center.x * world.tileSize, cultures[i][0].center.y * world.tileSize);
		
		for(var k = 1; k < cultures[i].length; k++){
			cctx.lineTo(cultures[i][k].center.x * world.tileSize, cultures[i][k].center.y * world.tileSize);
		}

		cctx.closePath();
		cctx.fill();
	}


	return;
	if(start == undefined) start = 0;
	if(end == undefined) end = cultures.length;
	for(var i = start; i < end; i++){
		var xTot = 0;
		var yTot = 0;
		var xMin = Infinity;
		var xMax = -1;
		var yMin = Infinity;
		var yMax = -1;
		for(var k = 0; k < cultures[i].length; k++){
			var x = cultures[i][k].center.x;
			xTot += x;
			var y = cultures[i][k].center.y;
			yTot += y;
			if(x < xMin) {xMin = x;}
			if(x > xMax) {xMax = x;}
			if(y < yMin) {yMin = y;}
			if(y > yMax) {yMax = y;}
		}
		var centerX = Math.round(xTot / cultures[i].length);
		var centerY = Math.round(yTot / cultures[i].length);
		var center = {"x":centerX, "y":centerY};
		var radius = Math.max ((centerX - xMin), (centerY - yMin), (xMax - centerX), (yMax - centerY), 10);
		cultures[i].center = center;
		cultures[i].radius = radius;
        var context = cctx;
        var tileSize = world.tileSize;
		context.beginPath();
		context.arc(centerX*tileSize, centerY*tileSize, radius*tileSize, 0, 2 * Math.PI, false);
		var scale = (i * 256) / (end-start);
		cctx.fillStyle = "rgba("+scale+", "+scale+", "+scale+",0.5)";
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = '#003300';
		context.stroke();
	}
}