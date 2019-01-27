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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

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

	- Together 


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

function makeJumpTo(e)
{
	return function() { jumpTo(e); };
}

function makeChoice(text, fn, c)
{
	return new Choice(text, fn, c);
}

function jumpChoice(text, e, c)
{
	return new Choice(text, makeJumpTo(e), c);
}

function descChoice(text, description, c)
{
	return new Choice(text, function(){ return showEvent(new Event(description)); }, c);
}

/*
	Saturday, February 2nd


*/

var snoozed = false;
var clothed = false;
var phone = false;
var checkedNooneHome = false;
var bookOnFloor = true;
var braOn = false;
var shirtOn = false;
var pantsOn = false;

var secretMode = true;

function makeAwake()
{
	if(snoozed){
		return "Just as you feel yourself slipping away, the alarm starts playing again\nIf anything you feel even more tired";
	}
	return "You find yourself awake. It's 8am. An alarm is playing\nYou feel as though you've barely slept";
}

function makeGetup()
{
	var s = "You stumble out of bed. You're in your room\nThe house feels oddly quiet as if no one's home\nRemnants of last night's project are on an uncharacteristically messy desk";
	if(bookOnFloor) s += "\nTo your surprise, a book has fallen off the shelf";
	return s;
}

var events = {
	awake: dEvent(makeAwake, [jumpChoice("Get up", "getup"), jumpChoice("Snooze", "snooze")]),
	snooze: nEvent("You hit snooze, roll over to the other side and close your eyes.. and fade", "awake").effect(function(){ snoozed = true; }),
	
	phone: dEvent("Disabling the alarm, you notice something is odd with your phone"),
	
	//room
	getup: dEvent(makeGetup, 
	[jumpChoice("Get dressed", "dresser", function(){ return !clothed; }), jumpChoice("Look at the desk", "desk"), 
	 jumpChoice("Have a look in the Ollivander's box", "wands", function(){ return secretMode && !bookOnFloor; }), jumpChoice("Pick up the book", "book", function(){ return bookOnFloor; }), jumpChoice("Check your phone", "phone"), jumpChoice("Pet the giraffe", "giraffe"), jumpChoice("Check if anyone's home", "house", function(){ return clothed && phone; })]),	
	desk: dEvent("You hardly remember what you were doing. There's all sorts of paper and colors and strings\nSigns of a glorious night"),
	giraffe: dEvent("Heyyyy giraffe! How ya doing?\nReaching up to some tasty leaves?\nNot missing the savannah too much?\nNot guarding a secret lair of any kind..", [ jumpChoice("That's a happy giraffe <i>pat pat</i>", "getup"), jumpChoice("<i>Pat pat</i>... wait what?", "getup")]),
	wands: dEvent("You're not sure what you're doing, but your mind is leading you to the Ollivander's box\nIt opens, revealing Rupert and his friends inside", [ jumpChoice("Good to know they're safe. Close the box", "getup"), jumpChoice("Let's see how Rupert's doing", "rupert"), , jumpChoice("I've always wondered what the merman got up to", "merman")]),
	book: dEvent("You're holding a Forensic Art book\nA skull glares at you, reminding you how cool the class in Texas was\nIt feels like an age ago", 
	[jumpChoice("Sigh. Put it back on the shelf", "shelf"), jumpChoice("Read for a bit", "reading")]),
	shelf: nEvent("You put the book on the shelf, right next to the Ollivander's wand box", "getup").effect(function(){ bookOnFloor = false }),
	phone: dEvent("You pick up your OnePlus, never fully over the loss of the once great Blackberry, ready to see last night's unread messages but there are none\n", []).effect(function(){ phone = true; }),
	dresser: dEvent("You go to the mirror to get dressed\nA bronze haired goddess looks back at you", 
	[descChoice("Put on a bra", "You pick one of the less sucky bras and strap on, one boob at a time", function(){ return !braOn && !shirtOn; }).effect(function(){ braOn = true; }), descChoice("Put on a t-shirt", "Time to make America emo again.. again", function(){ return !shirtOn; }).effect(function(){ shirtOn = true; }), descChoice("Put on pants", "Squuuuuueeeeze. Damn is that a fine butt", function(){ return !pantsOn; }).effect(function(){ pantsOn = true; }), jumpChoice("Looking good", "clothed", function(){ return pantsOn && shirtOn; })]).effect(function(){ clothed = true; }),
	clothed: nEvent(function(){ if(braOn) return "Looking sweet"; return "Looking sweet, and who needs a bra anyway"}, "getup"),
	
	//house
	house: dEvent("You head out of your room. Your parent's door is open and no one's there\nKelli's room is vacant aside from the bloodlusting Raskolnikov\nNo one's to be seen in the main area. It's very quiet\nPraaaaaise", 
	[jumpChoice("Go outside", "reccenter")]),
	
	//Kelli
	reccenter: dEvent("Approaching the Rec Center, you see the harrowing sight of walkers roaming the building\nThe thought that Kelli could be one of them is too awful to even consider. She must be alive\nYou can either rush in through the front, or sneak around and find a back entrance", 
	[jumpChoice("Enter the Rec Center", "reccenter2")]),
	reccenter2: dEvent("You hear glorious sound of a laugh that could only belong to Kelli\nWhere is she? She must be close", 
	[jumpChoice("Follow the laugh", "reccenter3")]),
	reccenter3: dEvent("<i>Ooooooly shit</i>\nYou can't believe what you're seeing\nThe ice rink is covered in blood\nA figure is skating around with a baseball bat in hand, acrobatically dancing around dodging and beating the crap out zombies\n<i>Eat shit you fuuuckers!</i>", [ jumpChoice("<i>KELLIIIIIII</i>", "kelli")]),



	/*
		Kelli at the Rec Center


	*/


};

$(document).ready(function(){
	setInterval(tick, 10);

	$(window).bind(
	  'touchmove',
	   function(e) {
	    e.preventDefault();
	  }
	);

	showEvent(events.awake);
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
	if(!event) { showEvent(lastEvent); return; }
	console.log("starting event");
	paused = true;

	var content = (event.contentFn) ? formatText(event.contentFn()) : event.content;
	$("#EventContent").html(content);
	$("#EventContent").fadeTo(0,0).fadeTo(700, 1.0);
	$("#EventChoices").fadeTo(0,0).fadeTo(1200, 1.0);
	var choices = $("#EventChoices").empty();

	$.each(event.choices, function(i, choice){
		if(choice.condition && !choice.condition()) return true;
		if(choice.text == "") console.log("choice text is empty for ", event);
		var div = $('<div class="event choice">'+choice.text+'</div>').click(function(e){ 
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
				if(choice.effects){ 
					$.each(choice.effects, function(i, effect){ effect(); });
				}
			}, 1500);
		});

		choices.append(div);							
	});

	var last = (event.next) ? event.next : lastEvent;
	if(last && last.length) last = events[last];
	if(choices.children().length == 0){
		setTimeout(function(){
			endEvent();
			$("#EventChoices").fadeTo(0,0);
			setTimeout(function(){
				showEvent(last);
			}, 1100);
		}, 1500);
	}

	if(event.effects){ 
		$.each(event.effects, function(i, effect){ effect();});
	}

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
	text = text.replaceAll('\n', "<p></p>");
	return text.replace(/\*([a-zA-Z]*)\*/gi, "<span class='note'>$1</span>");
}

function nEvent(content, next)
{
	var n = new Event(content, []);
	n.next = next;
	return n;
}

function dEvent(content, choices)
{
	return new Event(content, choices);
}

function Event(content, choices)
{
	if($.isFunction(content)) this.contentFn = content; 
	else this.content = formatText(content);

	this.choices = (choices) ? choices : [];

	this.effects = [];

	var t = this;
	this.effect = function(fn){
		t.effects.push(fn);
		return t;
	}
}

function Choice(text, effect, condition)
{
	this.text = formatText(text);
	this.condition = condition;

	this.effects = [];
	if(effect) this.effects.push(effect);

	var t = this;
	this.effect = function(fn){
		t.effects.push(fn);
		return t;
	}
}

