function repaint(worldToDraw, sizeX, sizeY, scale){
	repaint2();
	return;
	worldToDraw = (worldToDraw == undefined) ? world : worldToDraw;
	sizeX = (sizeX == undefined) ? worldToDraw.sizeX : sizeX;
	sizeY = (sizeY == undefined) ? worldToDraw.sizeY : sizeY;
	scale = (scale == undefined) ? worldToDraw.tileSize : scale;
	var canvas = $("#canvas")[0];
	clearCanvas(canvas);
	var ctx = canvas.getContext("2d");
	for(var x = 0; x < sizeX-1; x++){
		for(var y = 0;y < sizeY-1; y++){
			ctx.fillStyle = getColorForTile(worldToDraw.tiles[x][y]); 
			ctx.strokeStyle = ctx.fillStyle;
			ctx.beginPath();
			ctx.rect(x*scale,y*scale,scale,scale);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
	}
}



function aStar(start, goal){
	var goalCond,distanceFunc,heuristicFunc, returnFunc,failFunc;
	goalCond = function(node){
		return (node == goal);
	};
	distanceFunc = distanceBetween;
	heuristicFunc = heuristic;
	returnFunc = reconstructPath;
	failFunc = function(){return null;};
	return genericAStar(start,goal,goalCond,distanceFunc,heuristicFunc,returnFunc,failFunc);
}
function reconstructPath(start,goal){
	var path = [start];
	while(start.cameFrom !== undefined){
		path.push(start.cameFrom);
		start = start.cameFrom;
	}
	return path;
}


function selectNode(set){
	var lowestF = Infinity;
	var lowestIndex = 0;

	for(var i = 0; i < set.length; i++){
		var item = set[i];
		if(item.f !== undefined && item.f < lowestF){
			lowestF = item.f;
			lowestIndex = i;
		}
	}
	return lowestIndex;
}


function genericAStar(start,goal,goalCond,distanceFunc,heuristicFunc, returnFunc,failFunc){
	//cleanup(); // this is bad. make sure this isn't necessary. 
	var closedset = [];    // The set of nodes already evaluated.
    var openset = [start];    // The set of tentative nodes to be evaluated, initially containing the start node
    //came_from := the empty map    // The map of navigated nodes.
 
    start.g = 0    // Cost from start along best known path.
    start.f = start.g + heuristicFunc(start, goal)
 	var currentTile = start;
    while (openset.length > 0){
        var currentIndex = selectNode(openset);
    	currentTile = openset[currentIndex];
        if (goalCond(currentTile)){
            path = returnFunc(currentTile, goal);
            cleanup(closedset,openset);
            return path;
        }
        openset.splice(currentIndex,1);
        closedset.push(currentTile);
        for(var k = 0; k < currentTile.neighbours.length; k++){
        	var neighbor = world.tiles[currentTile.neighbours[k][0]] [currentTile.neighbours[k][1]];
            var gTentative = currentTile.g + distanceFunc(currentTile,neighbor);
            var m = member(neighbor, closedset);
            if(m != -1)
            	if(gTentative >= closedset[m].g)
                     continue;
            m = member(neighbor, openset);
            neighbor.cameFrom = currentTile;
            neighbor.g = gTentative;
            neighbor.f = gTentative + heuristicFunc(neighbor, goal);
            if(m == -1)
               openset.push(neighbor);
 		}
 	}
 	cleanup(closedSet);
    return failFunc();
}

function drawWorld(sizeX,sizeY,scale){
 sizeX = (sizeX == undefined) ? world.sizeX : sizeX;
 sizeY = (sizeY == undefined) ? world.sizeY : sizeY;
 scale = (scale == undefined) ? 16 : scale;
 for(var y = 0; y < sizeY-1; y++){
	 for(var x = 0; x < sizeX-1; x++){
		drawTile(world.tiles[x][y], x, y, scale); 
	 }
 }
}

function drawWorld2(svg, sizeX,sizeY,scale){
drawWorld3();//sizeX,sizeY,scale);
return;
/*todo:
 * Make sure this function is called only once
 * Find a solution for zooming. Preferrably one that doesn't involve waiting 5s.
 */
 sizeX = (sizeX == undefined) ? world.sizeX : sizeX;
 sizeY = (sizeY == undefined) ? world.sizeY : sizeY;
 scale = (scale == undefined) ? 4 : scale;
 var color;
 
 /*Check mode
    in world mode:
	  loop from 0 to size, increment by 4
	in local mode
	  loop from start to end, increment by 1
 */
 
 var startX = 0;
 var endX = sizeX-1;
 var startY = 0;
 var endY = sizeY-1;
 var increment = 1;
 if(false && mode == true)
 {
	startX = center.x - Math.floor(sizeX/4);
	startX = (startX < 0) ? 0 : startX; //make sure that these changes are compensated for by adding to the other end
	endX = center.x + Math.floor(sizeX/4);
	endX = (endX > sizeX-1) ? sizeX-1 : endX;
	startY = center.y - Math.floor(sizeY/4);
	startY = (startY < 0) ? 0 : startY;
	endY = center.y + Math.floor(sizeY/4);
	endY = (endY > sizeY-1) ? sizeY-1 : endY;
	increment = 1;
	scale *= 2;
 }
 for(var y = startY; y < endY; y += increment){
	 for(var x = startX; x < endX; x += increment){
		// for(var i = 0; i < 2; i++){
		//	 for(var k = 0; k < 2; k++){
		//color = getColorFromType(world.tiles[x][y].spaces[i][k].type);
		color = getColorFromType(world.tiles[x][y].type);
		if(filter && world.tiles[x][y].population > 0)
		{
		changeOverlay(svg,sizeX,sizeY,scale,function(x,y){
			if(world.tiles[x][y].population != 0)
			{
				return 'rgba('+Math.floor(100+155*world.tiles[x][y].population/largestCity)+',75,75,0.5)';
			}
			else{
				return 'rgba(0,0,0,0)';
			}
		});
		return;
		//color = 'rgba('+Math.floor(100+155*world.tiles[x][y].population/largestCity)+', 75, 75,0.5)';
		//alert(color);
		}
		
		svg.rect((x-startX)*scale, (y-startY)*scale, scale*increment, scale*increment,
			{onclick:'tileClick(evt)', type:'tile',id:x+","+y, fill: color, stroke: color, 'stroke-width': 1});
		svg.rect((x-startX)*scale, (y-startY)*scale, scale*increment, scale*increment,
			{onclick:'tileClick(evt)', type:"overlay",id:x+","+y, fill: color, stroke: color, 'stroke-width': 1});	
		//drawTile(world.tiles[x][y], x, y, scale);
		//	 }
		// }
	 }
 }
}

function determineAreaOld2(){
	areas = {water:[], grass:[], mountain:[], forest:[]};
	var time1 = new Date();
	var tile;
	idCounter = 0;
	
	for(var y = 0; y < world.sizeY; y++){
		for(var x = 0; x < world.sizeX; x++){
			tile = world.tiles[x][y];
			var done = false;
			var waitList = [];
			if(tile.type == "sand"){
				continue;	
			}
			for(var i = 0; i < tile.neighbours.length; i++){
				if(i == 4){
					continue;	
				}
				var neighbour = tile.neighbours[i];
				if(neighbour.type == tile.type){
					if(neighbour.field != null){
						if(!done){
						tile.field = neighbour.field;
						areas[tile.type][neighbour.field].tiles.push(tile);
						done = true;
						}
						else{
							for(var p = 0; p < areas[tile.type][neighbour.field].tiles.length; p++){
								areas[tile.type][neighbour.field].tiles[p].field = tile.field;
								idCounter++;
							}
							if(tile.field != neighbour.field){
								areas[tile.type][tile.field].tiles = areas[tile.type][tile.field].tiles.concat(areas[tile.type][neighbour.field].tiles);
								neighbour.field = tile.field;
							}
						}
					}
					else{
						if(done){
							areas[tile.type][tile.field].tiles.push(neighbour);
							neighbour.field = tile.field;
						}
						else{
							waitList.push(neighbour);
						}	
					}
				}
			}
			if(done){
				for(var k = 0; k < waitList.length; k++){
					waitList[k].field = tile.field;
					areas[tile.type][tile.field].tiles.push(waitList[k]);
				}
			}
			else{
				tile.field = areas[tile.type].length; //id of field
				areas[tile.type].push({id:areas[tile.type].length, tiles:[tile]});
			}
		}
	}
	var time2 = new Date();
	var diff = time2.getTime() - time1.getTime();
	alert(idCounter + " " + diff + "ms");
}


function determineArea(){ //just testing
	areas = {water:[], grass:[], mountain:[], forest:[]};
	var tile;
	var skip;
	idCounter = 0;
	for(var y = 0; y < world.sizeY; y++){
		for(var x = 0; x < world.sizeX; x++){
			tile = world.tiles[x][y];
			if(tile.type == "sand"){
				continue;	
			}
			var done = false;;
			if(tile.field == null){
				for(var i = 0; i < tile.neighbours.length; i++){
					if(i == 4){
						continue;	
					}
					if(tile.type == tile.neighbours[i].type){//most likely part of the same area
						if(tile.neighbours[i].field != null){
							if(done){
								if(tile.neighbours[i].field.id == tile.field.id){
								}
								else{
									var tempArea = tile.neighbours[i].field;
									for(var n = 0; n < tempArea.length; n++){
										tile.field.tiles.push(tempArea.tiles[n]);	
										tempArea.tiles[n].field = tile.field;
									}
									for(var k = 0; k < areas[tile.type].length; k++){
										if(areas[tile.type][k].id == tempArea.id){
											areas[tile.type].splice(k,1);	
										}
										else if(areas[tile.type][k].id == tile.field.id){
											areas[tile.type][k] = tile.field;	
										}
									}
								}
								tile.neighbours[i].field = tile.field;		
							}
							else{
								tile.field = tile.neighbours[i].field;
								tile.neighbours[i].field.tiles.push(tile);
								done = true;
							}
						}
					}
				}
				if(!done){
					tile.field = {id:generateUniqueId(), tiles:[tile, tile.neighbours[i]]};	
					areas[tile.type].push(tile.field);
				}
			}
		}
	}
}
