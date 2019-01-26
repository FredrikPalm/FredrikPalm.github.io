function random(min, max)
{
	return Math.random() * (max - min) + min;
}

function rgb(r,g,b,a)
{
	return "rgba(" + Math.round(r*255) + "," + Math.round(g*255) + "," + Math.round(b*255) + "," + a + ")";
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

function getHour(time){
	return Math.floor((time % 86400) / 3600);
}
function getMinute(time){
	return Math.floor((time % 3600) / 60);
}
function getSecond(time){
	return time % 60;
}

function clamp(v, min, max)
{
	return Math.max(Math.min(v, max), min);
}

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

var paused = false;
var time = 12 * 60 * 60, days = 0;

function Character(name, adult)
{
	this.name = name;

    //0 is good, 1 is bad
	this.injury = 	0.0;
	this.illness = 	0.0;
	this.hunger	= 	0.0;
	this.sad	= 	0.0;
	this.tired = 	0.0;
	this.cold	 = 	0.0;
	this.fear 	= 	0.0;
};

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

function jumpTo(e)
{
	showEvent(events[e]);
}

/*

	The clock ticks to 8am, SAT Feb 2nd, 2019
	Sagan May wakes up in her bed. She's 27

	The alarm rings, music plays. TODO: which song?

	- snooze
		- * more music *
		- get up
	- get up
		You roll out of bed, feeling sluggish. Your hip hurts.
		
		- check phone 
			- huh, no messages.
		- get dressed
			- sucky bra, The Maine t-shirt.
		
		
	- go to the rec center

	- Zombies all over
	- Kelli appears with a baseball bat, beating the shit out of zombies
	 - throwing cool Kelli quips
	 - join Sagan

	- go to Isaac's warehouse
	 - surrounded by zombies
	 - Isaac's fashioned artillery to beat the shit out of the zombies

	- 


	Event("You're in your bedroom", [new Choice("Get dressed", function(){
		// go to dresser event
	}))

	Event("You're looking at your dresser. There's ", [new Choice("Get dressed", function(){
		// go to dresser event
	}))



*/

function showTextThenGoTo(text, event, time)
{
	if(time === undefined) time = 1500;
	showEvent(new Event(text, []));
	return;
	setTimeout(function(){
		$("#EventContent").fadeTo(0,0);
		$("#EventChoices").fadeTo(0,0);
		showEvent(events[event]);
	}, time);
}

var events = [
	new Event("You wake up. It's 7am. It's quiet\nYou still feel tired as if you haven't slept", 
	[new Choice("Snooze", function(){ jumpTo(1); }), new Choice("Get up", function(){ jumpTo(2); })]),
	new Event("You hit snooze, roll over to the other side and close your eyes", 
	[new Choice("Snooze", function(){ showTextThenGoTo("Test", 1); }), new Choice("Get up", function(){ jumpTo(2); })]),
	new Event("You step out of the bed. You're in your room", 
	[new Choice("Get dressed", function(){ jumpTo(3); }), new Choice("Check your phone", function(){ showTextThenGoTo("Huh, no messages.", 2); })]),	
	new Event("You're looking at the dresser", 
	[new Choice("Get dressed", function(){ jumpTo(4); }), new Choice("Get up", function(){ jumpTo(2); })])	
];

$(document).ready(function(){
	setInterval(tick, 10);

	$(window).bind(
	  'touchmove',
	   function(e) {
	    e.preventDefault();
	  }
	);

	showEvent(events[0]);
});

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


var night = false; var nextDay = false;

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

function tick()
{
	if(!paused)
	{
	
	}

	/*
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
	*/
}

var lastEvent;

function showEvent(event)
{
	console.log("starting event");
	paused = true;

	$("#EventContent").html(event.content);
	$("#EventContent").fadeTo(0,0).fadeTo(700, 1.0);
	$("#EventChoices").fadeTo(0,0).fadeTo(1200, 1.0);
	var choices = $("#EventChoices").empty();

	var last = lastEvent;
	if(event.choices.length == 0){
		setTimeout(function(){
			endEvent();
			$("#EventChoices").fadeTo(0,0);
			setTimeout(function(){
				showEvent(last);
			}, 1100);
		}, 1500);
		lastEvent = event;
		return;
	}

	$.each(event.choices, function(i, choice){
		if(choice.text == "") console.log("choice text is empty for ", event);
		var div = $('<div class="event choice">'+choice.text+'</div>').click(function(e){ 
			var effect = event.choices[i].effect;
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
			endEvent();
			setTimeout(function(){
				if(effect) effect();
			}, 1500);
		});

		choices.append(div);							
	});

	lastEvent = event;
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
	$("#EventContent").fadeTo("fast", 0.0);
	setTimeout(function(){
		$("#EventChoices").fadeTo(0,0);
	}, 1000);		
}

function formatText(text)
{
	text = text.replace('\n', "<p></p>");
	return text.replace(/\*([a-zA-Z]*)\*/gi, "<span class='note'>$1</span>");
}

function Event(content, choices)
{
	this.content = formatText(content);
	this.choices = choices;
}

function Choice(text, effect)
{
	this.text = formatText(text);
	this.effect = effect;
}

