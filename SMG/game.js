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

var allies = [];
var enemies = [];

function Action(name, damage, cost)
{
	this.name = name;
	this.damage = damage;
	this.cost = cost;
}

function Character(name, level, image, actions)
{
	this.name = name;
	this.image = image;
	this.level = level;

	this.actions = (actions) ? actions : [ new Action("Attack", 10, 10) ];
}

function showFade(text)
{	
	$("#Tint").queue(function() {
	            		$(this).addClass("blurred").dequeue().delay(3000).queue(function() {
	            			$(this).removeClass("blurred").dequeue();
	            		});
	           		});
	$("#Announce").text(text).fadeTo(1000, 1.0, 
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

var battle = false;
var snoozed = false;
var gotup = false;
var clothed = false;
var phone = false;
var checkedNooneHome = false;
var bookOnFloor = true;
var braOn = false;
var shirtOn = false;
var pantsOn = false;
var checkedCar = false;
var sleptExtra = false;
var leveled = false;
var kelliJoined = false;
var isaacJoined = false;

var secretMode = true;

function makeAwake()
{
	if(snoozed && !leveled){
		return "Just as you feel yourself slipping away, the alarm starts playing again\nIf anything you feel even more tired";
	}
	var time = (leveled)? 11 : 10;
	return "You find yourself awake. It's " + time + ". An alarm is playing\nYou feel as though you've barely slept";
}

var firstGetup = true;
function makeGetup()
{
	var s = (firstGetup) ? "You stumble out of bed. " : "";
	firstGetup = false;
	s += "You're in your *room*\n"
	if(checkedNooneHome) s += "The house is very quiet and no one's home\n";
	else s += "The house feels very quiet as if no one's home\n";
	s += "Remnants of last night's project are on an uncharacteristically messy *desk*";
	if(bookOnFloor) s += "\nTo your surprise, a *book* has fallen off the shelf";
	return s;
}

function startBattle(encounter)
{
	battle = true;
	var text = (enemies.length == 1) ? enemies[0].name : "Bad Guys";
	if(encounter) text = encounter;
	showFade("Sagan May vs " + text);
	$("#BattleContainer").fadeTo(0, 0.0, 
		function()
		{
			$(this).delay(1000).fadeTo(1000, 1.0);
		});
}

var battleScenario = {
};

function battleEvent(enemies_, success, fail, encounter)
{
	return new dEvent("").effect(function(){
		enemies = enemies_;
		battleScenario.success = success;
		battleScenario.fail = fail;
		startBattle(encounter);
	});
}

var events = {
	awake: dEvent(makeAwake, [jumpChoice("Get up", "phoneStart", function(){ return !leveled}), jumpChoice("Get up", "getup", function(){ return leveled}), jumpChoice("Snooze", "snooze")]).effect(function(){showFade("")}),
	snooze: nEvent("You hit snooze, roll over to the other side and close your eyes.. and fade", "awake").effect(function(){ snoozed = true; }),
	
	//levelling
	phoneStart: nEvent("Disabling the alarm, you notice something is wrong with your phone", "phoneStart2"),
	phoneStart2: nEvent("First off, there's almost always a message from someone\nAnd today, on your <i>fricking</i> birthday, <b>none</b>\nNot like you care but that's weird", "phoneStart3").delay(5000),
	phoneStart3 : dEvent("And second.. there's this weird text:\n<span class=\"levelup\">LEVEL UP!</span>\n<span class=\"skillpoint\">1 Skill Point Gained</span>", [
		jumpChoice("The fuck?", "phoneStart4")
	]),
	phoneStart4 : dEvent("You click the screen and now it's asking where you'd like to put that skill point..", [
		jumpChoice("Uh, charisma I guess? [Charisma + 1]", "phoneStart5"),
		jumpChoice("Could always use some more strength [Strength + 1]", "phoneStart5"),
		jumpChoice("I'm an intellectual person [Intellect + 1]", "phoneStart5"),
	]).effect(function(){ leveled = true; }),
	phoneStart5: dEvent("<span class=\"levelup\">You're now a Level 27 Badass</span>\nOddly, you don't feel different..\nAlso, your phone doesn't have internet access", [
		jumpChoice("Alright, let's get up", "getup"),
		jumpChoice("Eh, let's just go back to bed. This is dumb", "awake").effect(function(){ sleptExtra = true; }),
	]),

	//room
	getup: dEvent(makeGetup, 
	[jumpChoice("Get dressed", "dresser", function(){ return !clothed; }), jumpChoice("Look at the desk", "desk"), 
	 jumpChoice("Have a look in the Ollivander's box", "wands", function(){ return secretMode && !bookOnFloor; }), jumpChoice("Pick up the book", "book", function(){ return bookOnFloor; }), jumpChoice("Check your phone", "phone"), jumpChoice("Pet the giraffe", "giraffe"), descChoice("Go back to bed", "<span class=\"level\">Can't sleep while there are enemies nearby</span>\nWhat?"), jumpChoice("Go to the main area", "house", function(){ return checkedNooneHome; }), jumpChoice("Check if anyone's home", "house", function(){ return clothed && !checkedNooneHome; })]).effect(function(){ gotup = true; }),
	desk: dEvent("You hardly remember what you were doing\nThere's all sorts of paper and colors and strings\nSigns of a glorious night"),
	giraffe: dEvent("Heyyyy giraffe! How ya doing?\nReaching up to some tasty leaves?\nNot missing the savannah too much?\nNot guarding a secret lair of any kind..", [ jumpChoice("That's a happy giraffe <i>pat pat</i>", "getup"), jumpChoice("<i>Pat pat</i>... wait what?", "getup")]),
	wands: dEvent("You're not sure what you're doing, but your mind is leading you to the Ollivander's box\nIt opens, revealing Rupert and his friends inside", [ jumpChoice("Good to know they're safe. Close the box", "getup"), jumpChoice("Let's see how Rupert's doing", "rupert"), , jumpChoice("I've always wondered what the merman got up to", "merman")]),
	book: dEvent("You're holding a Forensic Art book\nA skull glares at you, reminding you how cool the class in Texas was\nIt feels like an age ago", 
	[jumpChoice("Sigh. Put it back on the shelf", "shelf"), descChoice("Read for a bit", "You read\nBringing life to the dead is so cool")]),
	shelf: nEvent("You put the book on the shelf, right next to the Ollivander's wand box", "getup").effect(function(){ bookOnFloor = false }),
	phone: dEvent("You pick up your OnePlus, never fully over the loss of the once great Blackberry\nNo internet access\n"),
	dresser: dEvent("You go to the mirror to get dressed\nA bronze haired goddess looks back at you", 
	[descChoice("Put on a bra", "You pick one of the less sucky bras and strap on, one boob at a time\nGoodbye glorious freedom", function(){ return !braOn && !shirtOn; }).effect(function(){ braOn = true; }), descChoice("Put on a T-shirt", "Time to make America emo again.. again", function(){ return !shirtOn; }).effect(function(){ shirtOn = true; }), descChoice("Put on pants", "<i>Squuuuuueeeeze</i>. Damn is that a fine butt", function(){ return !pantsOn; }).effect(function(){ pantsOn = true; }), jumpChoice("Looking good", "clothed", function(){ return pantsOn && shirtOn; })]).effect(function(){ clothed = true; }),
	clothed: nEvent(function(){ if(braOn) return "Looking sweet"; return "Looking sweet, and who needs a bra anyway"}, "getup"),
	
	//house
	house: dEvent("You head out of your room. Your parents' door is open and no one's there\nKelli's room is vacant aside from the bloodlusting Raskolnikov\nNo one's to be seen in the main area. It's very quiet\n<i>Praaaaaise</i>", 
	[ descChoice("Get some breakfast. <i>Mmm</i>", "Yum"), descChoice("Let's restart that router", "<i>Click</i>. <i>Click</i>\nNope, still nothing"), descChoice("Let's see if there's anything on the TV", "Static. Fuuuuck that's <i>weird</i>"), descChoice("Let's just chill for a bit", "You lay down on the couch, pull the blanket up. It's comfy\nYou could sleep like this"), jumpChoice("Go back to your room", "getup"), jumpChoice("Go outside", "outsideZombie")]).effect(function(){ checkedNooneHome = true; }),

	//outside
	outsideZombie: dEvent("You go out into the cold *outside*\nYour trusty *Saab* stands parked in its usual spot\nBehind it, you notice your *neighbor* standing still just looking at you\nWhy is he always creepy?\nOn a closer look, you realize there's something off", [
		jumpChoice("Ignore the creep and get in the Saab", "saabFail"),
		jumpChoice("Go talk to your neighbor, see if he knows what's up", "neighbor")	
	]),
	saabFail: dEvent("<i>Ah, *Svenska*</i>! What a beauty!\nYou feel the familiarity of Swedish leather as you slide down into the comfy seat\nYou push in the clutch and turn the key.. but the car won't start\n!Goddammit!", [
		descChoice("Try again", "Yeah no, it doesn't start.."),
		jumpChoice("Get out and see if the neighbor can help", "askNeighborHelp"),
		descChoice("Call someone for help", "Yup, phone still not working"),
		jumpChoice("Right, let's pop the hood open and get down to business", "carHood"),
	]).effect(function(){ checkedCar = true; }), 
	carHood: dEvent("You get out of the car and glance at the *neighbor* just standing there like a zombie. Creep\nYou walk around and open the hood. Your hands are freezing\nIt's pretty clear the *battery* is dead\nYou could jump-start it with another *car*", [
		jumpChoice("Ask your neighbor", "askNeighborHelp"),
		descChoice("Check if there's another option in the garage", "Nope. Fuck"),
	]),

	//neighbor
	askNeighborHelp: nEvent("As much as you hate asking for help, it's probably your best option right now", "neighbor"),
	neighbor: dEvent("You walk up to the neighbor\nAs you get closer, your start feeling very uncomfortable\nSomething is wrong", [
		jumpChoice("There's only one way to find out..", "neighbor2"),
		jumpChoice("Actually, no. Fuck that", "outsideZombie", function(){ return !checkedCar})
	]),
	neighbor2: dEvent("As you walk closer, you notice weird gray sludge in the snow behind him\nHe's mostly standing still with his arms in an unnatural position\nHe's an odd bluish gray color\nHis mouth is hanging open\nYup. That's a creepy zombie neighbor", [
		jumpChoice("Fight", "fightNeighbor"),
		jumpChoice("Fuck that. Get out of there. Nope", "neighbor3"),
	]),
	fightNeighbor: battleEvent([ new Character("Creepy Neighbor", "Lv 1 Zombie")], "fightSuccess", "fightFail"),
	fightSuccess: dEvent("His head falls off\n!What! !The! !Fuck!\n<i>This is fucked up</i>", [

	]),
	fightFail: dEvent("You fall", [

	]),

	saabGood: dEvent("Like a true Swede, the loyal Saab can always be trusted\nExcept when it has a breakdown\nBut now it's back up and ready to go!", [
		jumpChoice("Go look for Kelli at the Rec Center", "reccenter"),
		jumpChoice("Go look for Isaac at the warehouse", "warehouse"),
		jumpChoice("Flee the city on your own. Who needs other people anyway", "flee"),
	]),
	flee: dEvent("Channeling Sammy, you put the car into gear and drive off towards the horizon\nNo one quite knows what happened to her, but legends tell of a bronze haired girl finally free from the reins of society\nRoaming the country on her own, causing her very own kind of mayhem", [
		jumpChoice("Game Over", "gameover"),
		jumpChoice("Actually... let's not do that", "saabGood")
	]),
	
	//Kelli
	reccenter: dEvent("Approaching the Rec Center, you see the harrowing sight of zombies surrounding the building\nThe thought that Kelli could be one of them is too awful to even consider. She must be alive\nYou can either rush in through the front, or sneak around and find a back entrance", 
	[jumpChoice("Enter the Rec Center", "reccenter2")]),
	reccenter2: dEvent("You hear the glorious sound of a laugh that could only belong to Kelli\nWhere is she? She must be close", 
	[jumpChoice("Follow the laugh", "reccenter3")]),
	reccenter3: dEvent("<i>Hooooooly shit</i>\nYou can't believe what you're seeing\nThe ice rink is covered in blood\nA figure is skating around with a baseball bat in hand, acrobatically dancing around dodging and beating the crap out of zombies\n<i>Eat shit you fuuuckers!</i>", [ jumpChoice("<i>!KELLIIIIIII!!!!!</i>", "kelli")]),
	kelli: dEvent("<i>Hey Sagan!</i>\n<i>I'm a warrior now</i>\nShe swings the bat at a zombie and its head goes flying\n", [ jumpChoice("<i>!KELLIIIIIII!!!!!</i>", "kelli2")]),



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

	$("body").removeClass("blurred");

	allies.push(new Character("Sagan May", "Lv 27 Badass", "smg.jpg"));

	showEvent(events.neighbor);
});

function buildCharUI(character, type, forBattle, index)
{
	var img = (character.image) ? "<img class='Avatar' src='"+ character.image +"'/>" : "";
	var name = "<div class='charAttribute'>"+ character.name +"</div>";
	var level = "<div class='charAttribute'>"+ character.level +"</div>";
	var health = "<div class='charHealth'>"+ "&nbsp;" +"</div>";
	var stamina = "<div class='charStamina'>"+ "&nbsp;" +"</div>";
	var id = "Char" + index;
	if(!character.image && forBattle){
		//name before health
		return $("<div id='"+id+"' class='"+type+"'>" + name + level + health + stamina + "</div>");
	}
	if(forBattle)
		return $("<div id='"+id+"' class='"+type+"'>" + img + health + stamina + name + level + "</div>");
	return $("<div class='"+type+"'>" + img + name + level + "</div>");
}

function startBattleUI()
{
	var allyContainer = $("#Allies");
	var enemyContainer = $("#Enemies");
	allyContainer.empty();
	enemyContainer.empty();

	for(var i = 0; i < allies.length; i++){
		allyContainer.append(buildCharUI(allies[i], "ally", true, i));
	}

	for(var i = 0; i < enemies.length; i++){
		enemyContainer.append(buildCharUI(enemies[i], "enemy", true, i));
	}

	if(enemies.length == 0){
		battle = false;
	}
}

var currentCharacter;
var lastCharacter;

function makeAction(action){
	return $("<div></div>").addClass("button", "actionButton").text(action.name);
}

function updateBattleUI()
{	
	if(!currentCharacter) currentCharacter = allies[0];
	var characterChanged = currentCharacter != lastCharacter;
	lastCharacter = currentCharacter;
	if(characterChanged)
		$("#BattleActions").empty();

	for(var i = 0; i < allies.length; i++){
		var ally = allies[i];
		if(ally == currentCharacter){
			//some indicator
			//update the actions
			if(characterChanged){
				for(var j = 0; j < ally.actions.length; j++){
					$("#BattleActions").append(makeAction(ally.actions[j]));
				}
			}
		}

		var c = $("#Char" + i);
		if(c.length == 0) continue;
	}

	for(var i = 0; i < enemies.length; i++){

	}

	if(enemies.length == 0){
		battle = false;
	}
}

function tick()
{
	if(!paused)
	{
	
	}
	
	var showCharacter = gotup && !battle;
	var showing = !$("#CharacterContainer").hasClass("hidden");
	if(showCharacter != showing){
		$("#CharacterContainer").toggleClass("hidden");
	}

	var showEvent = !battle;
	showing = !$("#EventContainer").hasClass("hidden");
	if(showEvent != showing){
		$("#EventContainer").toggleClass("hidden");
	}

	var showBattle = battle;
	showing = !$("#BattleContainer").hasClass("hidden");
	if(showBattle != showing){
		$("#BattleContainer").toggleClass("hidden");
		if(showBattle) startBattleUI();
	}
	if(showBattle) updateBattleUI();

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
		var delay = (event.timedelay === undefined) ? 2500 : event.timedelay;
		setTimeout(function(){
			endEvent();
			$("#EventChoices").fadeTo(0,0);
			setTimeout(function(){
				showEvent(last);
			}, 1100);
		}, delay);
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
	text = text.replace(/\!([a-zA-Z]*)\!/gi, "<div class='shake'>$1</div>");
	text = text.replace(/(\[.*?\])/gi, "<span class='attribute'>$1</span>");
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

	this.timedelay = 2500;

	this.delay = function(d){
		this.timedelay = d;
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

