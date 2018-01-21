function random(min, max)
{
	return Math.random() * (max - min) + min;
}

function select(array)
{
	return array[Math.floor(random(0, array.length))];
}

function toUpper(s)
{
	return s[0].toUpperCase() + s.substr(1);
}

function swap(a, b)
{
	var c = a;
	a = b;
	b = c;
}

var digits = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var counts = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tens = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function toCount(n)
{
	if(n < 20) return counts[n];
	var ten = tens[Math.floor(n / 10) - 2] + "y";
	if(n % 10 == 0) return ten;
	return ten + "-" + counts[n % 10];  
}

function number(n) 
{
	if(n < 20) return digits[n];
	var ten = tens[Math.floor(n / 10) - 2];
	if(n % 10 == 0) return ten + 'ieth';
	return ten + 'y-' + digits[n % 10];
}

var paused = false;
var time = 12 * 60 * 60, days = 0;
var finalDay = 90;
var group = [];

var nightTimer = 0;
var nightStage = 0; var nightDone = false;
var events = [];
var rations = [ ]; // how many days old?
var firewood = 0;
var fireStrength = 0;

var walking = true;

var moving = true;

function Character(name, adult)
{
	this.name = name;
	this.adult = adult;

    //0 is good, 1 is bad
	this.injury = 	0.0;
	this.illness = 	0.0;
	this.hunger	= 	0.0;
	this.sad	= 	0.0;
	this.tired = 	0.0;
	this.cold	 = 	0.0;
	this.fear 	= 	0.0;

	this.weapon = 0.0;

	this.huntAbility = function()
	{
		if(this.dead()) return 0;
		if(!this.adult) return 0;
		return Math.max(0.0, (Math.max(1.0, this.weapon) * 1.0 - (this.injury * 2 + this.illness * 2 + this.sad + this.tired + this.fear) / 2)); 
	}

	this.affect = function(state, change, desc)
	{
		if(this.dead() || change == 0) return;
		var name = this.name;
		this[state] = clamp(this[state] + change, 0, 1);

		//UHHH
		$("#GroupContainer .character .name").each(function(i, e)
		{
			var span = $(e);
			if((span.text() == name)){
				var color = rgb(0.6,0.6,0.6,1), background;
				if(change < 0) {
				//	color = rgb(0.2, Math.min(1.0, 0.2 - change), 0.2);
					background = rgb(20/255, 250/255, 20/255, 0.09);
				}
				else{
				//	color = rgb(Math.min(1.0, 0.2 + change), 0.2, 0.2, 1.0);
    				background = rgb(250/255, 20/255, 20/255, 0.09);
    			}

    			var effect = $("<span class='effect'>" + desc + "<span>").css({color:color,background:background});
				span.after(effect);
				effect.fadeTo(200, 1.0).delay(1000).fadeTo(1000, 0.0).delay(1000).queue(function() {
	            		$(this).remove().dequeue();
	           		});
			}
		});
	};

	this.dead = function()
	{
		if(this.illness >= 	1.0) return true;
		if(this.injury >= 	1.0) return true;
		if(this.hunger >= 	1.0) return true;
		if(this.morale >= 	1.0) return true;
		if(this.stamina >= 	1.0) return true;
		if(this.warmth >= 	1.0) return true;
		if(this.fear >= 	1.0) return true;
	};

	this.getMood = function()
	{
		if(this.injury	> 0.5) return "injured";
		if(this.illness	> 0.5) return "ill";
		if(this.hunger	> 0.5) return "hungry";
		if(this.morale	> 0.5) return "depressed";
		if(this.stamina	> 0.5) return "tired";
		if(this.warmth	> 0.5) return "cold";
		if(this.fear	> 0.5) return "worried";
		return "happy";
	};

	var searching = false;
};

function getHour(time){
	return Math.floor((time % 86400) / 3600);
}
function getMinute(time){
	return Math.floor((time % 3600) / 60);
}
function getSecond(time){
	return time % 60;
}

function showDayOfWinter()
{	
	var s = (days + 1 == finalDay) ? "Last" : toUpper(number(days+1)); 
	$("#Tint").delay(500).queue(function() {
	            		$(this).addClass("blurred").dequeue().delay(2500).queue(function() {
	            			$(this).removeClass("blurred").dequeue();
	            		});
	           		});
	$("#DayOfWinter").text(s + " Day of Winter").delay(1000).fadeTo(2000, 1.0, 
		function()
		{
			$(this).delay(1000).fadeTo(1000, 0.0);
		});
}

$(document).ready(function(){
	setInterval(tick, 10);

	$(window).bind(
	  'touchmove',
	   function(e) {
	    e.preventDefault();
	  }
	);

	group.push(new Character("Haphor", true));
	group.push(new Character("Siri", true));
	group.push(new Character("Ragvan", true));
	group.push(new Character("Vaecra", true));
	group.push(new Character("Egil", false));

	updateGroupUI();
	$("#Fire").css("opacity", 0.0);

	showDayOfWinter();

	$(".characterIcon").draggable({ accept:function(){ return modifyActions; }, revert: "invalid" });
	$("#ActionContainers .action.box").droppable({
	accept: function(draggable) { 
		var container = $(this).children(".characterIcons");
		if(container.children().length >= 4) return false;
		return true;
	},

	activeClass: ".ui-state-active",
    hoverClass: ".ui-state-hover",

	drop: function( event, ui ) {
		console.log("dropped");

		ui.draggable.removeAttr("style");
		$(this).children(".characterIcons").append(ui.draggable);
		updateActions();
		return true;
	}
	});
});

function rgb(r,g,b,a)
{
	return "rgba(" + Math.round(r*255) + "," + Math.round(g*255) + "," + Math.round(b*255) + "," + a + ")";
}

function search(character)
{
	character.action = "out";
	updateGroupUI();
}

function buildCharacterUI(character)
{
	var div = $('<div class="character"></div>');
	div.append('<span class="name">'+character.name+'</span>');
	var action = $('<span class="action">'+character.getMood()+'</span></div>').click(function()
	{
		search(character);
	});

	if(character.action == "")
		action.addClass("button");

	div.append(action);
	return div;
}

function updateGroupUI()
{
	var container = $("#GroupContainer");
	container.empty();
	for(var i = 0; i < group.length; i++)
	{
		if(group[i].dead()) continue;
		container.append(buildCharacterUI(group[i]));
	}
}

function clamp(v, min, max)
{
	return Math.max(Math.min(v, max), min);
}

var night = false; var nextDay = false;
var lastEvent = { day : 0, time : 12 * 60 * 60};

function timeSince(t)
{
	if(t > time)
		t -= (24 * 60 * 60)
	return time - t;
}

function pulse(i, freq, min, max)
{
	return min + max * (1 - 2.0 * (Math.abs(0.5 - (i % freq) / (freq - 1))));
}

function itemEvent(text, adultOnly, effect)
{
	var choices = [];
	$.each(group, function(i, p){
		if(group[i].dead() || (adultOnly && !group[i].adult)) return true;
		var e = effect;
		if(effect !== undefined && !isNaN(effect)){
			e = function(){ group[i].weapon = effect; };
		}
		choices.push(new Choice("Give to " + group[i].name, e));
	});
	return new Event(text, function(){ return true; }, choices);
}

function updateActions()
{
	$("#ActionContainers .action.box").each(function(i, e){
		var characters = [];
		$(this).children(".characterIcons").children().each(function(i, c){
			characters.push($(c).text());
		});
		//$(this).children(".footer").text(": " + characters.join(" "));
	});
}

var fireTick = 0;
function tick()
{
	if(!paused)
	{
		if(group.length == 0){
			showEvent(new Event("There is nothing left", 1.0, [new Choice("So be it", function()
				{
					paused = true;
				})]));
			$("#Tint").css("background", "rgba(0, 0, 0, 0.9)");
			$("#Fire, #Amru").delay(1000).fadeTo(1000, 0.0);
		}

		time += 30;
		if(time >= 60 * 60 * 24){ 
			if(!nightDone) time -= 30;
			else{
				time = 0; days++; $("Time").text(days + "Days"); nextDay = true; 		
			}
		}

		updateActions();

		if(!night && time > 18 * 60 * 60){
			updateGroupUI();
			console.log("switch to night");
			night = true;
			nightTimer = 0;
			nightStage = 0;
			var s = 0.00;
			$("#Tint").css("background", rgb(s,s,s,0.85));
			$("#Fire").delay(1000).fadeTo(1000, 0.6);
		}
		else if(nextDay && night && time > 6 * 60 * 60)
		{
			updateGroupUI();
			console.log("switch to day");
			walking = true;
			nextDay = false;
			night = false;
			var s = 0.933;
			$("#Tint").css("background", rgb(s,s,s,0.2));
			$("#Fire").fadeTo(1000, 0.0);
			lastEvent = { days, time };

			showDayOfWinter();
		}

		if(night)
		{
			nightTime();
		}
		else
		{
			dayTime();
		}


		var s = (rations.length == 1) ? " ration" : " rations";
		$("#Rations").text(toUpper(toCount(rations.length)) + s);
		$("#Firewood").text(toUpper(toCount(firewood)) + " firewood");

		var eventChance = 0.0;
		if(walking && !night && time % 1200 == 0 && (lastEvent.days != days || (timeSince(lastEvent.time) > (3 * 60 * 60)))){
			eventChance = 0.8 * (timeSince(lastEvent.time) / (16 * 60 * 60));
			if(Math.random() > 1.0 - eventChance){
				var dayEvents = [];
				dayEvents.push(new Event("It is cold, and the winds are strong", function(){ return true; }, [new Choice("Seek shelter", function(){ walking = false; }), new Choice("Persist", function(){})]));
				dayEvents.push(new Event("It is cold, and the winds are strong", function(){ return true; }, [new Choice("Seek shelter", function(){ walking = false; }), new Choice("Persist", function(){})]));
				dayEvents.push(new Event("A circle of dead crows lie on ground", function(){ return true; }, [new Choice("Move on", function(){ })]));
				dayEvents.push(itemEvent("A *spear* lies in the snow", true, 2));
				dayEvents.push(itemEvent("A small *axe* rests on a rock", true, 1));
				dayEvents.push(itemEvent("A *dagger* sticks out of the snow", true, 1));
				
				//var axe = itemEvent("Built an axe", true, 2);
				//var tool = itemEvent("Built an axe", true, 2);
				//dayEvents.push(new Event("There is a" , function(){ return true; }, [new Choice("Seek shelter", function(){ walking = false; }), new Choice("Persist", function(){})]));
				
				if(startEvent(dayEvents)){
					lastEvent = { days, time };
				}
			}
		}

		//if(time % 1200 == 0) console.log(eventChance);
/*
		var min = 0.1;
		var max = 0.933;

		var s = Math.abs(time - 12 * 60 * 60) * 1.4 / (12 * 60 * 60);
		s = clamp(1.0 - s, min, max);
		$("body").css("background", rgb(s,s,s,1.0));
*/
	}

	if(night){
	fireTick = fireTick + 1;
	if(fireTick % 3 == 0){
			var fire = $("#Fire"); 
			var gt = days * 24 * 3600 + (fireTick * 30);
			var saturate = pulse(gt, 7200, 1, 5 * fireStrength) + '';
			var grayscale = (100 * pulse(gt, 3600, 1.0 - Math.max(0.1, fireStrength - 0.1), 1.0 - Math.max(0.3, fireStrength))) + "%";
			fire.css("-webkit-filter", "blur(1.0px) saturate("+saturate+") grayscale("+grayscale+")");
			fire.css("-moz-filter", "blur(1.0px) saturate("+saturate+") grayscale("+grayscale+")");
			fire.css("-o-filter", "blur(1.0px) saturate("+saturate+") grayscale("+grayscale+")");
			fire.css("filter", "blur(1.0px) saturate("+saturate+") grayscale("+grayscale+")");
		}
	}
}

function dayTime()
{
	for(var i = 0; i < group.length; i++)
	{
		group[i].hunger += random(1,3) * 0.0001;
		if(group[i].dead()) { 
			showEvent(nightEvent(group[i].name + " died", 0.2, "no", -0.5));
			group.splice(i, 1);
			updateGroupUI();
			i--;
		}
	}

	if(walking && time % 300 == 0 && Math.random() > 0.9)
	{
		var remove = Math.random() > 0.5;
		if(remove){
			for(var i = 0; i < rations.length; i++){
				if(rations[i] > 1 && Math.random() > 0.7) {rations.splice(i, 1); break;} 
			}	
		}
		else{
			var ability = 0;
			for(var i = 0; i < group.length; i++)
				ability += group[i].huntAbility();
			var c = Math.round(  (1.0 + ability) * Math.pow(random(0, 1), 3)  );
				
			if(Math.random() > 0.35){
				firewood = Math.min(12, firewood + c);
			}
			else if(Math.random() < ability){
				var c = Math.round(  (1.0 + ability) * Math.pow(random(0, 1), 3)  );
				for(var i = 0; i < c; i++){
					if(rations.length >= 12) break;
					rations.push(0);
				}	
			}
		}
	}
}

function finishRations()
{
	for(var i = 0; i < rations.length; i++)
		rations[i]++;
	paused = false;
	$("#InventoryContainer").fadeTo(700, 0.0).delay(700).hide(0);
	$("#EventContainer").show();
	nightStage++;

}

function giveRation(p)
{
	rations.pop(); //oldest first
	p.affect('hunger', random(-0.8, -0.5), "food");
	if(rations.length <= 0) finishRations();
	else selectRations();
}

function selectRations()
{
	if(rations.length <= 0) {finishRations(); return;} 
	paused = true;
	$("#EventContainer").hide();
	$("#InventoryContainer").show().fadeTo(500, 1.0);

	var s = (rations.length == 1) ? "ration" : "rations";
	$("#InventoryHeader").text("You have " + toCount(rations.length) + " food " + s);

	var list = $("#InventoryList").empty();

	$.each(group, function(i, p){
		if(group[i].dead()) return true;
		var div = $('<div class="inventory listItem">');
		div.append('<span class="name left">'+p.name+'</span>');
		var h  = "hungry";
		if(p.hunger == 0) h = "full";
		else if(p.hunger < 0.25) h = "fine";
		else if(p.hunger > 0.75) h = "starving";
		div.append('<span class="stat middle">'+h+'</span>');
		var button = $('<span class="button right">give</span>');
		button.click(function(){ giveRation(group[i]); });
		div.append(button); 
		list.append(div);
	});

	var store = $("<div>Save the rest for tomorrow</div>");
	store.click(finishRations).addClass("event choice button");
	list.append(store);
}

function nightEvent(text, chance, end, effect)
{
	var name = text.substr(0, text.indexOf(" "));//...
	if(effect != undefined && !isNaN(effect)) {
		//morale effect
		var e = effect;
		effect = function()
		{
			for(var i = 0; i < group.length; i++)
				group[i].affect('sad', random(0.0, 1.0) * -e, name);
		};
	}
	var event = new Event(text, 
		function(){
			var alive = false;
		 for(var i = 0; i < group.length; i++)
		 	if(group[i].name == name && !group[i].dead()) alive = true;
		 return alive && Math.random() < chance;
		  });
	event.choices = [new Choice(end, effect)];
	return event;
}

var nightEvents = 
[
	nightEvent("Siri sings a song", 0.2, "Everyone smiles", 0.5),
	nightEvent("Haphor tells a tale", 0.2, "Everyone smiles", 0.5),
	nightEvent("Ragvan cracks a joke", 0.2, "Everyone laughs", 0.5),
	//nightEvent("Vaecra ", 0.2, "Everyone laughs"),

	//craft items
	nightEvent("Vaecra has built a small *bow*", 0.05, "We can use it", 0.4),
	nightEvent("Egil plays with Amru", 0.05, "Everyone laughs", 0.4),
	//bad events
];

var dayRoundup = [];

function nightTime()
{	
	if(nightStage == 0 && nightTimer++ >= 100){
		//TODO
		fireStrength = clamp(firewood / 7, 0, 1);
		
		for(var i = 0; i < dayRoundup.length; i++){
			//show day results
			
		}

		nightStage++;
		nightTimer = 0;	
	}
	else if(nightStage == 1 && nightTimer++ >= 100){
		//TODO
		fireStrength = clamp(firewood / 7, 0, 1);
		
		nightStage++;
		
		if(rations.length <= 0){
			showEvent(nightEvent("You have no rations", 1.0, "So be it"));
			nightStage++;
		}
		else{
			selectRations();
		}
		nightTimer = 0;	
	}
	else if(nightStage == 3 && nightTimer++ >= 200){
		//show night event
		nightStage++;
		var s = (group.length == 1) ? "You sit quietly" : "You sit together quietly"; 
		var nullEvent = nightEvent(s, 1.0, "Try to sleep");
		var event = (group.length == 1) ? nullEvent : pickEvent(nightEvents, nullEvent);
		showEvent(event);
		firewood = Math.max(0, firewood - 7);
		nightDone = true;
	}
}

function clickChoice()
{

}

function showEvent(event)
{
	console.log("starting event");
	paused = true;

	$("#EventContent").html(event.content).fadeTo(0, 1.0);
	$("#EventContainer").fadeTo(0,0).fadeTo(700, 1.0);
	var choices = $("#EventChoices").empty();
	if(event.choices.length == 0)
	{
		console.log("no choices for event ", event);

		setTimeout(function()
			{
				endEvent();
				$("#EventContent").fadeTo("fast", 0.0);
			}, 2000);
		return;
	}

	$.each(event.choices, function(i, choice){
		if(choice.text == "") console.log("choice text is empty for ", event);
		var div = $('<div class="event choice">'+choice.text+'</div>').click(function(e){ 
			var effect = event.choices[i].effect;
			endEvent();
			if(effect) effect();
			$("#EventContent").fadeTo("fast", 0.0);
			var ch = this;
			$("#EventChoices .choice").each(function(i, t)
			{
				if(t == ch){
					$(t).fadeTo(1000, 0.0).css("padding-left", "30px");
				} 
				else
					$(t).fadeTo('fast', 0.0);
			});
			//console.log(this);
			//$(this).fadeTo(2.0, 0.00);
		});

		choices.append(div);							
	});
}

function startEvent(events)
{
	var event = pickEvent(events); 
	if(event.content != "") {
		showEvent(event);
		return true;
	}
	return false;
}

function endEvent()
{
	paused = false; 
}

function formatText(text)
{
	return text.replace(/\*([a-zA-Z]*)\*/gi, "<span class='note'>$1</span>");
}

function Event(content, condition, choices)
{
	this.content = formatText(content);
	this.condition = condition;
	this.choices = choices;
}

function Choice(text, effect)
{
	this.text = formatText(text);
	this.effect = effect;
}



function generateEvent()
{

}


//events.push(new Event("The carrion of a deer ", function(){ return true; }, [new Choice("Bury it", function(){}), new Choice("Leave", function(){})]))
// 
//
//
//
//

function pickEvent(eventList, nullEvent)
{
	nullEvent = (nullEvent === undefined) ? new Event("") : nullEvent;
	eventList = (eventList === undefined) ? events : eventList;

	var pickFrom = [];
	for(var i = 0; i < eventList.length; i++)
	{
		if(eventList[i].condition()){
			pickFrom.push(eventList[i]);
		}
	}
	if(pickFrom.length > 0)
		return select(pickFrom);

	return nullEvent;
}