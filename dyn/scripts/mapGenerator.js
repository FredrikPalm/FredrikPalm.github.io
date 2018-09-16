// uses parallel.js to generate a map with web workers
var params;
var sizeX;
var sizeY;
var mapRules;
var world;
var m;
var depthMax = 20;
var tileTypes = ["grass","water","forest","mountain", "settlement"];
var rivers = [];
var year = 0;

function importResources(){
	importScripts("res/malenames-french.js","res/femalenames-french.js","res/surnames-french.js");
	importScripts("people.js", "../../scripts/mersenne-random.js","../../scripts/json.js", "aStar.js"); //also aStar, history, events, and whatever else I'd like to share between main program and this
}

onmessage = function(event){
	if(event.data === "start"){
		if(!sizeX)
			craftNewWorld();
	}
	else{
		params = event.data;
		sizeX = params.sizeX;
		sizeY = params.sizeY;
		mapRules = params.mapRules;
		postMessage("hi! " + params.name);
		importResources();
		m = new MersenneTwister(params.seed);	
		craftNewWorld();
		self.close();
	}
}

function World(sizeX,sizeY){
	this.tiles = [];
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.tileSize = 4;
	this.dynasty = {};
	this.options = {};
	this.areas = {};
	this.people = [];
	this.cities = [];
	this.cultures = [];
	this.roads = [];
	this.rivers = [];
}

function Resource(name, value, type, areaType, chance, foodValue, drinkValue)
{
	this.name = name;
	this.value = value;
	this.tileType = type;
	this.areaType = areaType;
	this.chance = chance;
	this.foodValue = foodValue;
	this.drinkValue = drinkValue;
}

function Tile(gP, type, neighbours) {
	this.globalPosition = gP; // position in world
	this.localPosition; // position on screen. null if not in view
	this.type = type; // grass, forest, mountain, water
//	this.neighbours = neighbours; // tiles surrounding this one
	this.spaces = []; // subtiles (3x3)
	this.selected = false; // whether the tile is currently selected or not
	this.field = null; //the lake, mountain range, forest or grassland this tile is a part of (if any)
	this.resources =  [];
	this.baseValue = 0;
	this.value = 0;
	this.population = 0;
	this.people = [];
	this.community = null;//deprecated
	this.borders = null;
	this.depth;
	this.height;
}

function Area(){
	this.tiles;
	this.type;
	this.id;
	this.name;
}

function addToArea(area,location){
	area.tiles.push(location); //TILE ID!!
	lookUpCoord(location).field = area.id;
}
function appendAreas(area1,area2){
		/*This can probably be improved*/
		for(var i = 0; i < area2.tiles.length; i++)
		{
			addToArea(area1, area2.tiles[i]);
		}
		areas['totalAmount'] = areas['totalAmount'] - 1;
		areas[area2.type] = areas[area2.type] - 1;
		delete areas[area2.id];
	};

function City(){ //"extends" Area
	this.name;
	this.population;
	this.resources;
	this.value;
	this.location;
	this.people;
}

function timeDiff(t0,t1,message){
	sendMessage(message + (t0.getTime() - t1.getTime()) +  "ms");
}

var sendMessages = true;
function sendMessage(message){
	if(sendMessages){
		postMessage(message);
	}
}
var print = sendMessage;
function random(min,max){
	if(max == undefined){
		max = min;
		min = 0;
	}
	min = Math.ceil(min);
	max = Math.floor(max);
	if(max < min){
		var swap = max;
		max = min;
		min = swap;
	}
	var res = Math.round(m.random()*(max-min)+min);
	return res;
}

function craftNewWorld(times){
	world = new World(sizeX,sizeY);
	world.areas = {};
	world.people = [];
	world.cities = []; 
	world.cultures = []; 
	world.roads = []; 
	world.rivers = [];
	sendMessage("WELCOME\n");
	sendMessage("Starting world generation");
	sendMessage("Starting terrain generation");
	sendMessage("Generating world of size " + world.sizeX + "X" + world.sizeY + " tiles");
	var t1 = new Date();
	var tStart = t1;
	world.tiles = generateTerrain(world.sizeX,world.sizeY);
	var t2 = new Date();
	timeDiff(t2,t1,"Terrain generation took : ");
	if(times === undefined) times = 7;
	sendMessage("\nEroding world " + times + " times");
	t1 = new Date();
	world.tiles = beautify(world.tiles, times);
	t2 = new Date();
	timeDiff(t2,t1,"Erosion took : ");
	t1 = new Date();
	sendMessage("\nMeasuring depths");
	measureDepth(world,0,false);//,1,true); //needs tiles to measure
	t2 = new Date();
	timeDiff(t2,t1,"Depth measurement took : ");
	
	t1 = new Date();
	sendMessage("\nFinding areas");
	checkAreas();				//needs settlements from generatePopulation
	t2 = new Date();
	timeDiff(t2,t1,"Finding areas took : ");

	sendMessage("\nGenerating rivers");
	t1 = new Date();
	generateRiversRandomly(100000000);		//need0s depth from measureDepth
	t2 = new Date();
	timeDiff(t2,t1,"River generation took : ");
	sendMessage("\nGenerating resources");
	t1 = new Date();
	generateResources();		//needs depth from measureDepth
	t2 = new Date();
	timeDiff(t2,t1,"Resource generation took : ");
	sendMessage("\nDetermining tile values");
	t1 = new Date();
	determineValue();			//needs resources from generateResources
	t2 = new Date();
	timeDiff(t2,t1,"Value calculation took : ");
	t1 = new Date();
	sendMessage("\nGenerating population");
	generatePopulation(); 		//needs values from determineValue
	t2 = new Date();
	timeDiff(t2,t1,"Population generation took : ");
	t1 = new Date();
	sendMessage("\nFinding areas again");
	checkAreas();				//needs settlements from generatePopulation
	t2 = new Date();
	timeDiff(t2,t1,"Finding areas took : ");
	t1 = new Date();
	sendMessage("\nGenerating roads");
	generateRoads();
	t2 = new Date();
	timeDiff(t2,t1,"Road generation took : ");
	var player = allPeople[random(0,allPeople.length-1)]; //new generatePerson(); //needs areas to pick a city at random.
	createDynasty(player); //move these to newGame()
	sendMessage("\nWorld generation done!");
	var tEnd = new Date();
	timeDiff(tEnd,tStart,"World generation took : ");
	world.areas = areas;
	world.rivers = rivers;
	world.plates = plates;
	world.people = allPeople;
	world.population = people;
	world.cities = cities; 
//	world.cultures = cultures;
	postMessage(JSON.stringify(world)); 
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
var minEdge = 1;
var maxEdge = 12;
function generateTerrain(sizeX, sizeY){
	var size = sizeX * sizeY;
	var temp = [];
	var randomN;
	var sources = [];
	var center = {"x":sizeX/2, "y":sizeY/2};
	var radius = sizeX / 2 - 2;
	for(var y = 0; y < sizeY; y++){ //iteration 1
		for(var x = 0; x < sizeX; x++){
			var type = "grass";
			if(y == 0){
				temp[x] = [];
			}
			var edge = random(minEdge,maxEdge);
			if(euclideanDistance({"x":x,"y":y},center) > radius + random(0,5)){
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
    var lowestAllowedDistanceST = 50;//size*0.001;
	var lowestAllowedDistanceDT = 20;//size*0.0001;
	for(var i = 0; i< tileTypes.length;i++) 
	{
		if(tileTypes[i] != "forest") continue;
		var type = tileTypes[i];
		var averageSize = 1+size*((mapRules[tileTypes[i]]["size"]["min"] + mapRules[tileTypes[i]]["size"]["max"])/2);
		var amount = Math.round((mapRules[tileTypes[i]]["freq"]*size)/averageSize);
		for(var k = 0; k < amount; k++){
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
				if(types['water'] > 0 && tile.type == "mountain" && (random(6) > 2)){
					tile.type = "grass";	
				}
			}
		}
	}
	return temp;
}

var riverSources = [];
function measureDepth(worldT, type, heightModeOn){
	worldT = (worldT == undefined) ? world : worldT;
	type = (type == undefined) ? 0 : type;
	heightModeOn = (heightModeOn == undefined) ? false : heightModeOn; 
	var tile;
	var tiles = worldT.tiles;
	var borderFound;
	var depth = 0;	
	var heightSet = false;
	var depthSet = false;
	for(var x = 0; x < worldT.sizeX; x++){
		for(var y = 0; y < worldT.sizeY; y++){
			tile = tiles[x][y];
			borderFound = false;
			if(type == 1 && (tile.type != "water" && tile.type != "mountain")){
				continue;
			}
			if(type == 2 && (tile.type == "water" || tile.type == "mountain")){
				continue;
			}
			depth = 0;
			heightSet = false;
			depthSet = false;
			while(!borderFound){
				var yInc = 1;
				if(depth >= depthMax) {
					borderFound = true;
					break;
				}
				for(nx=-depth;nx<=depth;nx++){
					if(Math.abs(nx) == depth){
						yInc = 1;
					}
					else{
						yInc = 2*depth;
					}
					for(ny=-depth;ny<=depth;ny += yInc){	
						if(Math.abs(nx) == depth || Math.abs(ny) == depth){
							var cx = nx+x;
							var cy = ny+y;
							if(cx > 0 && cx < worldT.sizeX && cy > 0 && cy < worldT.sizeY){
								if(worldT.tiles[cx][cy].type != tile.type){
									if(heightModeOn && type == 2 && !heightSet && worldT.tiles[cx][cy].type == "mountain"){
										tile.height = worldT.tiles[cx][cy].height - 3 - 2*(depth);//-1);
										if(tile.height < 0) tile.height = 0;
										heightSet = true;
										/*if(tile.heigth < minHeight/2){
											tile.height = Math.ceil(minHeight/2);
										}*/
									}
									else if(heightModeOn && type == 2 && !heightSet && worldT.tiles[cx][cy].type == "water"){
										tile.height =  worldT.tiles[cx][cy].height + 3 + 2*(depth-1);
										if(tile.height > 0) tile.height = 0;
										heightSet = true;
										/*if(tile.heigth > maxHeight/2){
											tile.height = Math.floor(maxHeight/2);
										}*/
									}
									if(tile.type == "grass"){
										borderFound = (worldT.tiles[cx][cy].type == "water");
									}
									else if(tile.type == "forest"){
										if(!depthSet){
											depthSet = true;
											tile.depth = depth-1;
										}
										borderFound = heightSet || !heightModeOn;
									}
									else{
										if(tile.type == "mountain"){
											if(depth == 1 && random(300) > 275){
												riverSources.push({"x":cx,"y":cy});
											}
										}
										borderFound = true;
										break;
									}
								}			
								
							}
							else{
								//borderFound = true;
							}
								
						}
						if(borderFound) break;
					}
					if(borderFound) break;
				}
				depth++;
			}
			if(!depthSet){
			tile.depth = depth-1;
			}
			if(heightModeOn && tile.type == "mountain"){
				tile.height = 30+tile.depth;
				if(maxHeight < tile.height){
					maxHeight = tile.height;
				}
			}
			else if(heightModeOn && tile.type == "water"){
				tile.height = -30-tile.depth;
				if(minHeight > tile.height){
					minHeight = tile.height;
				}
			}
		}
	}
}

var cities;
var areas;
function jQ(){
	this.each = function(a,f){
		var keys = Object.keys(a);
		for(var i = 0; i < keys.length; i++){
			f(keys[i],a[keys[i]]);
		}
	}
}
var $ = new jQ();
var checkedPreviously = false;
function checkAreas(worldT){
	areas = {"totalAmount":0,"id":0};
	$.each(tileTypes, function(i,val){
		areas[val] = 0;
	});

	worldT = (worldT == undefined) ? world : worldT;
	if(checkedPreviously){
		for(var x = 0; x < worldT.tiles.length; x++){
			for(var y = 0; y < worldT.tiles[0].length; y++){
				delete(worldT.tiles[x][y].field);
			}
		}
	}
	checkedPreviously = true;
	for(var x = 0; x < worldT.sizeX; x++){
		for(var y = 0; y < worldT.sizeY; y++){
			var tile = worldT.tiles[x][y];
			for(var nx = -1; nx < 2; nx++){
				for(var ny = -1; ny < 2; ny++){	
					var cx = x+nx;
					var cy = y+ny;
					if((nx == 0 && ny == 0) || (cx > worldT.sizeX-1) || (cx < 0) || (cy > worldT.sizeY-1) || (cy < 0) || tile.type != worldT.tiles[cx][cy].type){
						//add borders
						if(Math.abs(nx) != Math.abs(ny)){
							if(tile.borders == null){
								tile.borders = [];
							}
							switch(nx){
								case -1:
									//add border to the left
									tile.borders.push("left"); //Use enum? (left = 0, right = 1 etc)
									break;
								case 1:
									//add border to the right
									tile.borders.push("right")
									break;
								case 0:
									switch(ny){
										case -1:
											//add border above
											tile.borders.push("above")
											break;
										case 1:
											//add border below
											tile.borders.push("below");
											break;
									}
									break;
							}
						}
					}
					else{
						var nTile = worldT.tiles[cx][cy];
						if(tile.field != null){
							if(nTile.field != null){
								if(tile.field == nTile.field)
								{
									//do nothing
								}
								else{
									//append fields	
									appendAreas(areas[tile.field], areas[nTile.field]);
								}
							}
							else{
								//add nTile to tile.field
								addToArea(areas[tile.field], nTile.globalPosition);
							}
						}
						else if(nTile.field != null){
							//add tile to nTile.field
							addToArea(areas[nTile.field], tile.globalPosition);
						}
						else{
							//create new field and add both
							var field = new Area();
							field.id = "a"+areas['id']++;
							field.name = "TEMP " + tile.type.toUpperCase() + "AREA";
							field.tiles = [tile.globalPosition, nTile.globalPosition];
							field.type = tile.type;
							areas[field.id] = field;
							areas['totalAmount'] = areas['totalAmount'] + 1;
							areas[field.type]++
							tile.field = nTile.field = field.id;
						}
					} 
				}
			}
		}
	}
	var keys = Object.keys(areas); 
	cities = [];
	for(var i = 0; i < keys.length; i++){
		if(keys[i][0] == "a" && areas[keys[i]].type != undefined)
		{
			if(areas[keys[i]].type == "settlement"){
				cities.push(areas[keys[i]]);
			}
		}
	}
}

function inBounds(world,x,y){
	return (x >= 0 && x < world.sizeX && y >= 0 && y < world.sizeY);
}


function generateResourcesforTile(type, areaType)
{
	var res = [];
	var keys = Object.keys(resourceData);
	for(var i = keys.length;i--;) 
	{
		if(resourceData[keys[i]].tileType != type) continue;
		if(resourceData[keys[i]].areaType != areaType && resourceData[keys[i]].areaType != 'any') continue;
		var r = random(1000);
		if(r <= resourceData[keys[i]].chance*10)
		{
			res[keys[i]] = random(10);
		}
	}
	return res;
}



/*		GENERATE RESOURCES
 *
 *	List of naturally occurring resources: 
 *   Grassland: Cow (shallow), Sheep, Horse (deep), Wheat
 *   Mountain:  Stone, Iron (deep), Copper (deep), Coal (deep) 
 *   Forest: 	Wood (deep), Pigs (shallow)
 *	 Water:		Fish, Drinking water (shallow)
 *	
 */
function generateResources(){
	resourceData = 
	{
	/*  variable, 			Name, Value, TileType, AreaType, Chance of Occuring, Foodvalue, Drinkvalue, Depletion   */
		'cow':new Resource("Cow", 80, 'grass', 'shallow', 5, 1000, 100),
		'sheep':new Resource("Sheep", 60, 'grass', 'any', 2, 400, 0),
		'horse':new Resource("Horse",70, 'grass', 'deep', 1, 200, 0),
		'wheat':new Resource("Wheat",50, 'grass', 'any', 10, 500, 0),
		'stone':new Resource("Stone",10, 'mountain', 'any', 100, 0, 0),
		'iron':new Resource("Iron",1000, 'mountain', 'any', 0.15, 0, 0),
		'copper':new Resource("Copper",700, 'mountain', 'any', 0.20, 0, 0),
		'coal':new Resource("Coal",200, 'mountain', 'any', 2, 0, 0),
		'wood':new Resource("Wood",10, 'forest', 'any', 100, 0, 0),
		'pigs':new Resource("Pigs",50, 'forest', 'any', 3, 800, 0),
		'fish':new Resource("Fish",10, 'water', 'any', 10, 400, 0),
		'dwater':new Resource("Drinking Water",1, 'water', 'shallow', 100, 0, 1000),
		'sand':new Resource("Sand",1,'sand','any',100, 0, 0)
	}
	var tiles = world.tiles;
	var max = 0;
	var min = 100;
	for(var x = 0; x < world.sizeX; x++)
	{
		for(var y = 0; y < world.sizeY; y++)
		{
			var tile = tiles[x][y];
			var type = tile.type;
			var vicinity = [];
			var sameType = 0;
			var types = {grass:0, water:0, mountain:0, forest:0, sand:0};
			var shallow = true;
			var count = 0;
			for(nX = -2; nX < 3; nX++)
			{
				for(nY = 2; nY > -3; nY--)
				{ 	
					
					cX = x + nX;
					cY = y + nY;
					if((nY == 0 && nX == 0) || cX < 0 || cY < 0 || cX >= world.sizeX || cY >= world.sizeY){
						continue; //out of bounds
					}
					else{
						count++;
						vicinity.push(tiles[cX][cY]);
						var nType = tiles[cX][cY].type;
						if(nType == tile.type){
							sameType++;
						}
						types[nType]++;
					}
				}
			}
			if(count > max) max = count;
			if(count < min) min = count;
			if(sameType < 24){
			
				if(type == "grass")
				{
					if(types['water'] + types['sand'] > 1)
					{
						//fertile
						//randomly add wheat, rice, pigs etc
						tile.resources = generateResourcesforTile(type,'shallow');
					}
				}					
				else
				{
					tile.resources = generateResourcesforTile(type,'shallow');
				}
			}
			else
			{
				tile.resources = generateResourcesforTile(type,'deep');
			}
		tiles[x][y] = tile;	
		}
	}
}

function resourceValues(resources)
{
	var res = 0;
	var keys = Object.keys(resources);
	for(var i = keys.length;i--;) 
	{
		if(resourceData[keys[i]] == undefined) continue;
		res += resources[keys[i]]*resourceData[keys[i]].value;
	}
	return res;
}

function determineValue(){
	for(var x = 0; x < world.sizeX; x++){
		for(var y = 0; y < world.sizeY; y++){
			var tile = world.tiles[x][y];
			var value = 100;
			value += resourceValues(tile.resources);
			tile.value = value;
			tile.baseValue = value;
			world.tiles[x][y] = tile;
			/*value =+ tile.vicinity.resources / 100;
			if(tile.type == "grass"){
				value = (fertile) ? value + 100 : value - 100;	
			}*/
			//if tile is valuable
			//for each neighbour, increase value by 50
		}
	}
	for(var x = 0; x < world.sizeX; x++){
		for(var y = 0; y < world.sizeY; y++){
			var tile = world.tiles[x][y];
			var value = 0;
			for(nX = -2; nX < 3; nX++){
				for(nY = 2; nY > -3; nY--){ 	
					cX = x + nX;
					cY = y + nY;
					if((nY == 0 && nX == 0) || cX < 0 || cY < 0 || cX >= world.sizeX || cY >= world.sizeY){
						continue; //out of bounds
					}
					value += Math.floor(world.tiles[cX][cY].baseValue/5);
				}
			}
			tile.value += value;
			world.tiles[x][y] = tile;
		}
	}
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

function generateRiverFrom(start,riverLength){
	var goal = world.tiles[0][0]; //ignore
	goalCond = function(node){
		return (node.type == "water") && (node.river != undefined || areas[node.field].tiles.length > 10);
	}
	distanceFunc = function(node1,node2){
		if(node2.type == "water") return 1;
		if(node1.type == node2.type){
			if(node1.depth > node2.depth){
				return 40;
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
			return 1;
		}
		else if((node1.type == "grass" || node1.type == "forest") && node2.type == "mountain"){
			return Infinity;
		}
		else if((node1.type == "grass" || node1.type == "forest") && node2.type == "sand"){
			return 1;
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
		sendMessage("Generated river of length " + path.length + " , there are now " + rivers.length + " rivers");
		return path;
	}
	function failFunc(){
		sendMessage("Failed to generate a river");
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
		var start = lookUpCoord(cities[i].tiles[0]);
		var x1 = start.globalPosition.x;
		var y1 = start.globalPosition.y;
		var goal = lookUpCoord(cities[(i + 1) % cities.length].tiles[0]);
		var x2 = goal.globalPosition.x;
		var y2 = goal.globalPosition.y;
		
		sendMessage("    Working on road " + i + " from ("+x1+","+y1+") to ("+x2+","+y2+")");
		if(heuristic(start,goal) < 100)
			generateRoadTo(start,goal,1000);
		else{
			sendMessage("    Abandoned work on road, as it was deemed too expensive");
			abandon++;
		}
	}
	sendMessage("    Generated " + (i - abandon) + " roads")
	lastSeason = -1;
}