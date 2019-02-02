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

function Action(name, damage, cost, cond, aoe)
{
	this.name = name;
	this.damage = damage;
	this.cost = cost;
	this.condition = cond;
	this.aoe = aoe;
}

function Character(name, level, image, actions)
{
	this.name = name;
	this.image = image;
	this.level = level;
	
	this.fullHealth = 100;
	this.health = this.fullHealth;
	
	this.fullStamina = 100;
	this.stamina = this.fullStamina;

	this.actions = (actions) ? actions : [ new Action("Attack", 10, 10) ];
	this.protecting = {};
}

function showFade(text)
{	
	$("#Tint").addClass("blurred").delay(3000).queue(function() {
	            			$(this).removeClass("blurred").dequeue();
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

function descJumpChoice(text, description, next, c)
{
	return new Choice(text, function(){ return showEvent(nEvent(description, next)); }, c);
}

function branchChoice(text, description, next, branch, c)
{
	return new Choice(text, function(){ 
		if(branch())
			return showEvent(nEvent(description, next)); 
		return showEvent(new Event(description));
	}, c);
}

/*
	Saturday, February 2nd


*/

var sagan = {};
var kelli = {};
var isaac = {};

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
var hasWeapon = false;
var hasRock = false;
var hasShovel = false;
var cryCount = 0;
var shoulderDislocated = false;
var secretMode = false;
var honk = 0;

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
	battleDone = false;
	currentCharacter = undefined;
	lastCharacter = undefined;
	lastAction = undefined;
	battleOrder = 0;
	lastCharacterParty = [ undefined, undefined ];

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
	}).battle();
}

function makeZombieAttack()
{
	var a = new Action("Attack", 10, 10);
	a.hitText = function(src, dst, damage){
		return src.name + " flails wildly at " + dst.name + " and does " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " flails aimlessly towards " + dst.name + " but misses";
	};

	a.critText = function(src, dst, damage){
		return src.name + " lands a cruching blow on " + dst.name + " and does " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.8;
	};

	a.critChance = function(src, dst){
		return 0.05;
	};

	return a;
}

function makeRockAttack()
{
	var a = new Action("Throw Rock", 20, 5);
	a.hitText = function(src, dst, damage){
		return src.name + " throws the rock and hits " + dst.name + " in the gut doing " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " aims bravely but misses " + dst.name + " completely";
	};

	a.critText = function(src, dst, damage){
		return src.name + " throws perfectly and hits " + dst.name + " right in the face doing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.5;
	};

	a.critChance = function(src, dst){
		return 0.2;
	};

	a.effect = function(src, dst){
		for(var i = 0; i < src.actions.length; i++){
			if(src.actions[i] == a){
				src.actions.splice(i, 1);
				return "You threw the rock and can't get it back";
			}
		}
		return "";
	};

	return a;
}

function makeShovelAttack(level)
{
	var a = new Action("Attack", 8 + level * 2, 0);
	a.hitText = function(src, dst, damage){
		return src.name + " swings the shovel wildly at " + dst.name + " and does " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " misses " + dst.name + " with the shovel";
	};

	a.critText = function(src, dst, damage){
		return src.name + " hits " + dst.name + " in the head with a heavy blow doing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.8;
	};

	a.critChance = function(src, dst){
		return 0.2;
	};

	a.effect = function(src, dst){
		if(random(0.0, 1.0) > 0.05) return "";
		for(var i = 0; i < src.actions.length; i++){
			if(src.actions[i] == a){
				src.actions.splice(i, 1);
				return "The shovel broke!";
			}
		}
		return "";
	};

	return a;
}

function branch(description, next, condition)
{
	if(condition()){
		showEvent(nEvent(description, next));
		return;
	}
	showEvent(new Event(description));
}

function makeZombie(name, level)
{
	var z = new Character(name, "Lv " + level + " Zombie", undefined, [ makeZombieAttack() ]);
	z.health = z.fullHealth = 50 + 12 * level; 
	return z;
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
	[descChoice("Put on a bra [Comfort - 5]", "You pick one of the less sucky bras and strap on\nOne boob at a time\nGoodbye glorious freedom", function(){ return !braOn && !shirtOn; }).effect(function(){ braOn = true; }), descChoice("Put on a T-shirt [Coolness + 3]", "Time to make America emo again.. again", function(){ return !shirtOn; }).effect(function(){ shirtOn = true; }), descChoice("Put on pants [Craziness - 10]", "<i>Squuuuuueeeeze</i>. Damn is that a fine butt", function(){ return !pantsOn; }).effect(function(){ pantsOn = true; }), jumpChoice("Looking good", "clothed", function(){ return pantsOn && shirtOn; })]).effect(function(){ clothed = true; }),
	clothed: nEvent(function(){ if(braOn) return "Looking sweet"; return "Looking sweet, and who needs a bra anyway"}, "getup"),
	
	//house
	house: dEvent("You head out of your room. Your parents' door is open and no one's there\nKelli's room is vacant aside from the bloodlusting Raskolnikov\nNo one's to be seen in the main area. It's very quiet\n<i>Praaaaaise</i>", 
	[ descChoice("Get some breakfast. <i>Mmm</i>", "Yum"), descChoice("Let's restart that router", "<i>Click</i>. <i>Click</i>\nNope, still nothing"), descChoice("Let's see if there's anything on the TV", "Static. Fuuuuck that's <i>weird</i>"), descChoice("Let's just chill for a bit", "You lay down on the couch, pull the blanket up. It's comfy\nYou could sleep like this"), jumpChoice("Go back to your room", "getup"), jumpChoice("Go outside", "outside")]).effect(function(){ checkedNooneHome = true; }),

	//outside
	outside: dEvent("You go out into the cold *outside*\nYour trusty *Saab* stands parked in its usual spot\nBehind it, you notice your *neighbor* standing still just looking at you\nWhy is he always creepy?\nOn a closer look, you realize there's something off", [
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
		descJumpChoice("Kick the wheel", "!OOooooaauuawww!", "stubToe"),
		descChoice("Check if there's another option in the garage", "Nope\nNo cars there, everyone's out\nNothing else helpful either\nFuck"),
	]),
	stubToe: nEvent("That was pretty dumb", "carHood"),

	//neighbor
	askNeighborHelp: nEvent("As much as you hate asking for help, it's probably your best option right now", "neighbor"),
	neighbor: dEvent("You walk up to the neighbor\nAs you get closer, your start feeling very uncomfortable\nSomething is wrong", [
		jumpChoice("There's only one way to find out..", "neighbor2"),
		jumpChoice("Actually, no. Fuck that", "outside", function(){ return !checkedCar})
	]),
	neighbor2: dEvent("As you walk closer, you notice weird gray sludge in the snow behind him\nHe's mostly standing still with his arms in an unnatural position\nHe's an odd bluish gray color\nHis mouth is hanging open\nYup. That's a creepy zombie neighbor", [
		descJumpChoice("<i>Are you okay?</i>", "<i>#Uuhhuhuuuhhhuuuhhhuuu#</i>", "neighbor3"),
		jumpChoice("Fuck that. Get out of there. Nope", "neighbor3"),
	]),
	neighbor3: dEvent("Okay, he's a zombie but at least he's just sort of standing there\nYou really need to get out of here and find your people fast\nYour car doesn't work\nYour phone doesn't work", [
		jumpChoice("I need something to protect myself", "protect", function(){ return !hasWeapon; }),
		jumpChoice("I need to jump-start my car", "carOptions"),
		jumpChoice("Run past him and check if anyone else is inside the house", "runToNeighborHouse"),
	]),
	protect: dEvent("You look around but only spot a rock and a shovel sticking out of the snow", [
		descChoice("The rock seems good", "You pick up the rock", function(){ return !hasRock; }).effect(function(){
			hasRock = true;
			hasWeapon = true;
			allies[0].actions.push(makeRockAttack());
		}),
		descChoice("I'll get the shovel", "You pick up the shovel", function(){ return !hasShovel; }).effect(function(){
			hasShovel = true;
			hasWeapon = true;
			allies[0].actions.push(makeShovelAttack());
		}),
		jumpChoice("Okay, let's do some damage. Sorry neighbor", "fightNeighbor"),
		jumpChoice("Okay, now let's check the house", "runToNeighborHouse"),
	]),
	carOptions: dEvent("You need to use his car to start yours. He might have a key", [
		jumpChoice("If only I had something to hit him with..", "protect"),
		jumpChoice("Check his house. I can run past him", "runToNeighborHouse")
	]),
	runToNeighborHouse: dEvent("You dart past the creepy neighbor\nYou feel a shill down your spine as he turns\nYou reach the house and panic as he approaches from behind\nYou knock and yell\nNo response\nYou turn\nHe's right there staring at you", [
		jumpChoice("Fight him off", "fightNeighbor"),
	]),
	fightNeighbor: battleEvent([ makeZombie("Creepy Neighbor", 1)], "fightSuccess", "fightFail"),
	fightSuccess: dEvent("His head falls off\n!What! !The! !Fuck!\n<i>This is fucked up</i>", [
		branchChoice("Scream", "!Auahahahah!", "neighborCleanup", function(){ cryCount++; return cryCount > 2;}),
		branchChoice("Laugh", "!Auahahahah!", "neighborCleanup", function(){ cryCount++; return cryCount > 2;}),
		branchChoice("Cry", "!Auahahahah!", "neighborCleanup", function(){ cryCount++; return cryCount > 2;}),
	]),
	fightFail: nEvent("You fall\nThe zombie falls onto you, nmouth open, eating you alive\nYour vision blurs", "awake"),
	neighborCleanup: dEvent("You hear a gut wrenching shreik\nA woman runs out of the house\n!No!\nShe collapses in front of her husband", [
		jumpChoice("Oh, no", "neighborCleanup2"),
	]),
	neighborCleanup2: nEvent("You give her time", "neighborCleanup3"),
	neighborCleanup3: dEvent("She looks up at you and then down at the ground\n<i>I knew</i>", [
		jumpChoice("I'm so so sorry", "neighborCleanup4"),
	]),
	neighborCleanup4: dEvent("<i>He got sick last night</i>\n<i>It was all over the news, the pathogen, the disease</i>\nShe's struggling to speak, shaking", [
		jumpChoice("Wait, what's going on?", "neighborCleanup5"),
	]),
	neighborCleanup5: dEvent("<i>I don't know</i>\n<i>He's been different for a while. He couldn't remember</i>\n<i>He wasn't himself. He was gone</i>", [
		jumpChoice("It's a disease?", "neighborCleanup6"),
	]),
	neighborCleanup6: dEvent("<i>It spreads through the air\nPeople everywhere are getting sick like this</i>\n<i>GOSH DARN IT</i>\n", [
		jumpChoice("We should get out of here. I need to find my family. My car isn't working", "neighborCleanup7"),
	]),
	neighborCleanup7: dEvent("<i>I'm getting back inside\nIt's the only safe place\nYou can take the car if you want\nI won't need it</i>", [
		jumpChoice("Okay. Thank you. I'm sorry", "neighborCleanup8"),
	]),
	neighborCleanup8: dEvent("She takes one last look at her husband and walks back inside, clearly shaken", [
		jumpChoice("Get the Saab back up and running", "saabWork"),
	]),
	saabWork: nEvent("You fiddle with the cars for a while, and finally get it running\nAwesome!", "saabGood"),
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
	reccenter: dEvent("Approaching the Rec Center, you see the harrowing sight of zombies surrounding the building\nThe thought that Kelli could be one of them is too awful to even consider. She must be alive\nYou can either rush through the zombies at the front, or sneak around and find a safer entrance", 
	[
		jumpChoice("Rush the front", "reccenterFront"),
		jumpChoice("Sneak in the back", "reccenterBack"),
		descChoice("Honk", "<i>TUUUU</i>\nThe zombies barely react, but it looks like they're moving in your direction"),
		jumpChoice("Try to run over zombies", "reccenterAssault"),
	]),
	reccenterAssault: dEvent("You pat the wheel of your beloved car\n<i>Okay, let's do this</i>", [
		jumpChoice("Floor it", "assaultSuccess"),
		jumpChoice("Try to stay in control", "assaultFail"),
		jumpChoice("On second thought...", "reccenter"),
	]),
	assaultSuccess: dEvent("The engine roars as you speed toward one unlucky zombie\n!DUNK!\nThe body slams into the car with a crunching sound\nThe pedal still floored, you slam into another zombie crushing the first beneath the wheels and coming to a stop", [
		jumpChoice("Get out and run for it", "reccenterFightPreEasy"),
	]),
	assaultFail: dEvent("You drive towards the nearest zombie\n!CRUUUUUNCH!\nThe body slams into the car and you come to a stop\n", [
		jumpChoice("Get out and run for it", "reccenterFightPre"),
	]),
	reccenterFront: dEvent("This feels like it might be stupid, but you want to find Kelli fast\nYou get out and sprint towards the entrance\nThe zombies turn to face you and start moving\nYou won't be able to run past", [
		jumpChoice("Try anyway..", "reccenterFightPre"),
		jumpChoice("Turn around and run back", "reccenterBack"),
	]),
	reccenterFightPre: nEvent("You run, but a zombie grabs you and another blocks your path\nYou have to fight", "reccenterFight").delay(5000),
	reccenterFightPreEasy: nEvent("You run, but a remaining zombie grabs you\nYou have to fight", "reccenterFightEasy").delay(5000),
	reccenterFight: battleEvent([ makeZombie("Zombie", 3), makeZombie("Zombie", 3), makeZombie("Zombie", 1), makeZombie("Zombie", 1) ], "reccenterFightWin", "reccenterFightFail", "Zombie Horde"),
	reccenterFightEasier: battleEvent([ makeZombie("Zombie", 3), makeZombie("Zombie", 1) ], "reccenterFightWin", "reccenterFightFail", "Zombies"),
	reccenterBack: dEvent("You run around the side of the building\nThere are stairs leading to a side exit\nA zombie stands nearby but won't get in the way", [
		jumpChoice("Take the stairs", "reccenterBack2"),
	]),
	reccenterFightWin: nEvent("Woo, you did it\nThe last zombie falls and the entrance is free\nYou rush to enter", "reccenter2"),
	reccenterFightFail: nEvent("You fall, and life slips as zombies surround you", "awake"),
	reccenterBack2: dEvent("Fuck, the door is locked\nAnd now the zombie is at the foot of the stairs", [
		descChoice("Jank at the handle for a bit more", "Yeah, it doesn't budge\nNice try though"),
		descJumpChoice("Ram the door", "!DUNK!\n!AAAUUUUUUUUAAAAA!\nYou dislocated your shoulder!\nAt least the door is open", "dislocated"),
		jumpChoice("Let Isaac pick the lock", "isaacOpen", function(){ return isaacJoined; }),
	]),
	dislocated: dEvent("Fuck. Fuck fuck fuck fuck\nFuck\nYour shoulder is dislocated", [
		jumpChoice("Carry on anyway", "reccenter2"),
		descJumpChoice("Try to.. relocate it", "!aaaaa!\nIt's excrutiating but you manage to do it\nTime to move", "reccenter2"),
	]).effect(function(){ shoulderDislocated = true; sagan.health -= 20; }),
	isaacOpen: dEvent("<i>Hold on, let me see if I can open it</i>\nHe rummages around a seemingly endless pocket before producing a lockpick\nWith total focus and some silly faces, he gets the door open\n<i>Alohomora, was it?</i>", [
		jumpChoice("<i>I love you.... Now let's go!</i>", "reccenter2"),	
	]),

	reccenter2: dEvent("You enter and hear the glorious sound of a laugh that could only belong to Kelli\nWhere is she? She must be close", 
	[jumpChoice("Follow the laugh", "reccenter3")]),
	reccenter3: dEvent("<i>Hooooooly shit</i>\nYou can't believe what you're seeing\nThe ice rink is covered in blood\nA figure is skating around with a baseball bat in hand, acrobatically dancing around dodging and beating the crap out of zombies\n<i>Eat shit you fuuuckers!</i>", [ jumpChoice("<i>!KELLIIIIIII!!!!!</i>", "kelli")]),
	kelli: dEvent("<i>Sagan!</i>\nShe swings the bat at a zombie and its head goes flying\n<i>Let's kick some zombie butt</i>", [ jumpChoice("<i>!KEEEEELLIIIIIII!!!!!</i>", "kelli2")]).effect(function(){
		allies.push(kelli);
		kelliJoined = true;
	}),
	kelli2: battleEvent([ makeZombie("Fat Zombie", 5), makeZombie("Zombie", 3), makeZombie("Zombie", 3), makeZombie("Zombie", 3), makeZombie("Zombie", 1) ], "kelliFightWin", "kelliFightFail", "Zombie Horde"),
	kelliFightWin: dEvent("The last zombie falls to the ground\nYou're exhausted\n<i>Wooo</i>\n<i>Hey. Happy birthday</i>", [
		jumpChoice("Kelli! Are you okay??", "kelli3"),
	]),
	kelliFightFail: nEvent("You fall and Kelli lies lifeless on the ground, zombies approach\nYour vision fades to black", "awake").delay(10000),

	kelli3: dEvent("She gives a hug so big you almost fall over on the ice\nShe let's go and glides away on her skates looking at your feet\n<i>I'm surprised you haven't fallen over</i>", [
		descJumpChoice("<i>Haha, that's the first thing that comes to mind?", "<i>Guess so</i>", "kelli4"),
		jumpChoice("<i>I'm pretty sure I will collapse any second", "kelli4"),
	]),
	kelli4: dEvent("<i>You were pretty badass\nDid I see you headbutt that guy?\n", [
		descJumpChoice("<i>I barely remember</i>", "<i>It was cool as fuck</i>", "kelli5"),
		descJumpChoice("<i>You kicked ass too! And what's with the eyeliner?</i>", "<i>It's camo. I'm a warrior</i>", "kelli5"),
	]),
	kelli5: dEvent("<i>I'm glad you're okay</i>", [
		jumpChoice("<i>I'm glad you're okay too. Let's get out of here</i>", "kelli6"),
	]),
	kelli6: nEvent("Together, you rush out of the building the way you came and get in the Saab", "saabKelli"),
	saabKelli: dEvent("You're in the Saab together. It feels so good", [
		jumpChoice("Go find Isaac at the warehouse", "warehouse", function(){ return !isaacJoined; }),
		jumpChoice("You're all together", "allTogether", function(){ return isaacJoined; })
	]),
	
	/*
		Isaac
	*/
	warehouse: dEvent("You pull up to the warehouse\nThere are no zombies in sight\nIt looks like the warehouse has been fortified", [
		jumpChoice("See if anyone's inside", "warehouse1"),
	]),

	warehouse1: dEvent("You walk up to the entrance\n<i>Woooooosh</i>\nYou duck instinctively, an arrow just soared past you", [
		jumpChoice("Shit! Isaac! It's me!", "warehouse2"),
		jumpChoice("Rush inside", "warehouse2"),
	]),

	warehouse2: dEvent("A familiar face peaks out of the building\n<i>Sagan!\nShit, sorry. I rigged up some traps\nDidn't mean to scare you\n</i>You suddenly feel much better knowing he's okay", [
		jumpChoice("Head inside and hug", "warehouse3"),
	]),

	warehouse3: dEvent("I'm so glad you're safe!\nDo you know what's happening?", [
		jumpChoice("Yeah, I got the gist of it..", "warehouse4"),
	]).effect(function(){
		allies.push(isaac);
		isaacJoined = true;
		allies[0].actions.push(new Action("Crossbow Shot", 25, 30));
	}),

	warehouse4: dEvent("<i>It's messed up. It must have been spreading dormantly. Apparently most of California just dropped dead\nI've been trying to set up radios. It's the only thing that works\nHere, grab a knife</i>", [
		jumpChoice("Thanks, this is really useful", "warehouse5"),
	]),

	warehouse5: dEvent("<i>And I made this helmet, and this utility belt, and this crossbow, and this arcade cabinate\nThat last one is mostly for fun</i>", [
		jumpChoice("Haha that's cool... And what's that huge gun?", "warehouse6"),
	]),

	warehouse6: dEvent("<i>Oh yeah, so you know this World War 2 flamethrower replica I've been working on?\nHe holds the heavy gun up with both hands and coolly pulls the trigger\n<i>Click</i>\n<i>Click</i>\n<i>Okay.. it doesn't work every ti-<span style='color: #ef1515;'>!BOOOOOOOOOOOOOM!</span>\n", [
		jumpChoice("Well that's great", "warehouse7"),
	]),

	warehouse7: dEvent("The roof is on fire\n<i>It's a little bit unreliable, but it should take care of the zombies</i>", [
		jumpChoice("Yeah, we're not using that. It's too dangerous", "disagreeFlame"),
		jumpChoice("Awesome... we might need it", "agreeFlame"),
	]),

	disagreeFlame: dEvent("<i>I can fix it\nI'm bringing it with me just in case\nWe should probably get the hell out of here</i>", [
		jumpChoice("Rush outside", "warehouseOutside"),
	]),

	agreeFlame: dEvent("<i>I hope not. We should probably get the hell out of here, though</i>", [
		jumpChoice("Rush outside", "warehouseOutside"),
	]),

	warehouseOutside: dEvent("You rush out of the burning warehouse, carrying as many useful tools as you can\nAs you exit, you see that a group of zombies have gathered around the Saab", [
		jumpChoice("FIght them off", "warehouseBattle")
	]),

	warehouseBattle: battleEvent([ makeZombie("Fat Zombie", 5), makeZombie("Zombie", 3), makeZombie("Zombie", 1), makeZombie("Zombie", 1), makeZombie("Zombie", 1) ], "warehouseWin", "warehouseFail", "Zombie Horde"),

	warehouseWin: dEvent("The last of the zombies falls motionless onto the ground", [
		jumpChoice("Get in the Saab before more zombies appear", "warehouseAfter"),
	]),
	warehouseFail: nEvent("You fall\nLife slips away", "awake"),

	warehouseAfter: dEvent("You hurry into the Saab and set off back towards the city", [
		jumpChoice("Go find Kelli at the Rec Center", "reccenter", function(){ return !kelliJoined; }),
		jumpChoice("You're all together.", "allTogether", function(){ return kelliJoined; })
	]),

	allTogether: dEvent("<i>So what do we do now, Sagan?</i>", [
		jumpChoice("<i>We go find people to help</i>", "end"),
		jumpChoice("<i>We go where there are no people</i>", "end"),
	]),

	end: dEvent("The End", [
		jumpChoice(""),
	]),
};

function makePunchAttack()
{
	var a = new Action("Punch", 5, 2);
	a.hitText = function(src, dst, damage){
		return src.name + " punches " + dst.name + " in the jaw and does " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " tries to hit " + dst.name + " but misses";
	};

	a.critText = function(src, dst, damage){
		return src.name + " strikes " + dst.name + " square in the face with a heavy blow dealing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.95;
	};

	a.critChance = function(src, dst){
		return 0.1;
	};

	a.effect = function(src, dst){
		return "";
	};

	return a;
}

function makeKickAttack()
{
	var a = new Action("Kick", 10, 10);
	a.hitText = function(src, dst, damage){
		return src.name + " kicks " + dst.name + " for " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " swings a leg at " + dst.name + " but misses ungracefully";
	};

	a.critText = function(src, dst, damage){
		return src.name + " kicks " + dst.name + " with remarkable force dealing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.8;
	};

	a.critChance = function(src, dst){
		return 0.2;
	};

	a.effect = function(src, dst){
		return "";
	};

	return a;
}

function makeHeadButtAttack()
{
	var a = new Action("Headbutt", 25, 10);
	a.hitText = function(src, dst, damage){
		return src.name + " headbutts " + dst.name + " hard doing " + damage + " damage";
	};

	a.missText = function(src, dst){
		return "";
	};

	a.critText = function(src, dst, damage){
		return src.name + " headbutts " + dst.name + " so hard parts are sent flying doing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 1.0;
	};

	a.critChance = function(src, dst){
		return 0.25;
	};

	a.effect = function(src, dst){
		return "";
	};

	a.condition = function(src, dst){
		return src.rage;
	};

	return a;
}


function makeProtect()
{
	var a = new Action("Defend", -1, 0);
	a.hitText = function(src, dst, damage){
		return src.name + " kicks " + dst.name + "  " + damage + " damage";
	};

	a.missText = function(src, dst){
		return src.name + " swings a leg at " + dst.name + " but misses ungracefully";
	};

	a.critText = function(src, dst, damage){
		return src.name + " kicks " + dst.name + " with remarkable force dealing " + damage + " damage";
	};

	a.hitChance = function(src, dst){
		return 0.8;
	};

	a.critChance = function(src, dst){
		return 0.2;
	};

	a.effect = function(src, dst){
		dst.safe = true;
		src.protecting = dst;
		return "";
	};

	return a;
}

function makeKelli()
{
	var batHit = new Action("Bat Hit", 10, 3);
	var skateSlash = new Action("Skate Slash", 30, 10);
	skateSlash.effect = function(src, dst){
		src.safe = false;
	};
	var skateDodge = new Action("Skate Dodge", 0, 10);
	skateDodge.effect = function(src, dst){
		src.safe = true;
	};
	skateDodge.selfOnly = true;
	var kelli = new Character("Kelli", "Lv 20 Warrior", "kelli2.png", [ batHit, skateSlash, skateDodge ]);
	kelli.fullHealth = 80;
	kelli.health = 50;
	return kelli;
}

function makeIsaac()
{
	var wrenchStrike = new Action("Wrench Strike", 20, 2);
	var crossbow = new Action("Flamethrower", 10, 40, undefined, true);
	var isaac = new Character("Isaac", "Lv 26 Nerd", "isaac2.png", [ wrenchStrike, crossbow ]);
	return isaac;
}

$(document).ready(function(){
	setInterval(tick, 10);

	$(window).bind(
	  'touchmove',
	   function(e) {
	    e.preventDefault();
	  }
	);

	$("#Tint").removeClass("blurred");

	sagan = new Character("Sagan May", "Lv 27 Badass", "sagan2.png", [ makePunchAttack(), makeKickAttack(), makeHeadButtAttack() ]); //makeProtect()
	kelli = makeKelli();
	isaac = makeIsaac();

	allies.push(sagan);

	var hash = (window.location.hash) ? window.location.hash.substr(1) : "";
	if(window.location.hash && events[hash]){
		gotup = true;
		showEvent(events[hash]);
	}
	else 
		showEvent(events.awake);
});

function buildCharUI(character, type, forBattle, index)
{
	var img = (character.image) ? "<img class='Avatar' src='"+ character.image +"'/>" : "";
	var name = "<div class='charAttribute'>"+ character.name +"</div>";
	var level = "<div class='charAttribute'>"+ character.level +"</div>";
	var health = "<div class='charHealth'>"+ "&nbsp;" +"</div>";
	var stamina = "<div class='charStamina'>"+ "&nbsp;" +"</div>";
	var id = "Char" + type + index;
	if(!character.image && forBattle){
		//name before health
		return $("<div id='"+id+"' class='"+type+"'>" + name + level + health + stamina + "</div>").click(function(){ selectedTarget = character; });
	}
	if(forBattle)
		return $("<div id='"+id+"' class='"+type+"'>" + img + health + stamina + name + level + "</div>").click(function(){ selectedTarget = character; });
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
}

var currentCharacter;
var lastCharacter;

var battleState = 0;
var selectedAction;
var selectedTarget;
var lastAction;

function makeAction(action){
	return $("<span></span>").addClass("button").addClass("actionButton").text(action.name).click(function(){
		if(!battle || battleDone) return;
		if(currentCharacter && action.cost && action.cost > currentCharacter.stamina) {
			showBattleInfo("Not enough stamina");
			return;
		}
		battleState = 1;
		selectedAction = action;
		selectedTarget = undefined;
	});
}

function makeTarget(target){
	return $("<span></span>").addClass("button").addClass("targetButton").text(target.name).click(function(){
		if(!battle || battleDone) return;
		selectedTarget = target;
	});
}

function showBattleInfo(message, ally, hit, crit)
{
	if(!message || message.length <= 0) return;
	var previous = $(".battlePrompt");
	var top = "50%";
	if(previous.length != 0){
		var y = window.innerHeight * 0.5;
		var lastPos = previous.last().position().top;
		if(lastPos - y < 50)
			top = lastPos + 50;
	}

	var div = $("<div>").addClass("battlePrompt").text(message);
	div.addClass((ally)?"allyAction":"enemyAction");
	div.addClass((hit)?"hit":"miss");
	if(crit)div.addClass("crit");
	$("#BattlePrompts").append(div);
	div.css({position:"absolute","top":top,left:"50%",width:"100%","margin-left":"-50%"});
	div.animate({
		top: "-=50px",
	}, 2000, function(){
	div[0].parentElement.removeChild(div[0]);	 
	}).fadeTo(2000, 0.0);
}

function runAction(character, action, targets)
{
	if(!battle || battleDone) return;

	if(!targets.length)
		targets = [targets];

	for(var i = 0; i < targets.length; i++){
		var target = targets[i];
		if(target.health <= 0) continue;
		var chance = 0.9;
		if(action.hitChance) chance = action.hitChance(character, target);
		if(!!character.safe) chance = 0.1;
		var hit = random(0.0, 1.0) < chance;
		var crit = hit && action.critChance && random(0.0, 1.0) < action.critChance(character, target);
		if(hit){
			var damage = action.damage * random(0.8, 1.2);
			if(!!character.rage) damage *= random(2.0, 3.0);
			if(crit) damage *= random(1.5,2.5);
			damage = Math.round(damage);
			var fallback = character.name + " hits " + target.name + " with " + action.name + " for " + damage; 
			var fn = (crit && action.critText) ? action.critText : action.hitText;
			var message = (fn) ? fn(character, target, damage) : fallback;
			target.health -= damage;
			showBattleInfo(message, true, true, crit);
		}
		else{
			var fallback = character.name + " misses " + target.name + " with " + action.name;
			var message = (action.missText) ? action.missText(character, target) : fallback;
			showBattleInfo(message, true, false, false);
		}
	
		if(action.effect){ 
			var message = action.effect(character, target); 
			if(message && message.length > 0)
				showBattleInfo(message, true, false, false);
		}
	}

	if(action.cost) character.stamina -= action.cost
	if(character.stamina < 0) character.stamina = 0;

	battleState = 2;
}

var battleDone = false;
var battleOrder = 0;
var lastCharacterParty = [undefined, undefined];

function pickBestAction(enemy)
{
	var bestScore = -1;
	var bestAction;
	var bestTarget;
	for(var i = 0; i < enemy.actions.length; i++){
		var action = enemy.actions[i];
		var targets = (action.damage > 0) ? allies : enemies;
		for(var j = 0; j < targets.length; j++){
			if(targets[j].health <= 0) continue;
			if(action.condition && !action.condition(enemy, targets[j])) continue;
			var score = random(0.0, 1.0);
			if(score > bestScore){
				bestScore = score;
				bestAction = action;
				bestTarget = targets[j];
			}
		}
	}
	runAction(enemy, bestAction, bestTarget);
}

function updateBattleUI()
{	
	if(battleDone) return;
	if(!currentCharacter) { 
		currentCharacter = allies[0];
		lastCharacterParty[0] = currentCharacter;
	}

	var rage = kelli.health < kelli.fullHealth / 2;
	if(rage && !sagan.rage){
		showBattleInfo("Sagan goes into rage mode to protect Kelli");
	}
	sagan.rage = rage;

	if(battleState == 2){
		for(var s = 0; s < 2; s++){
			var list = (s == 0) ? allies : enemies;
			for(var i = 0; i < list.length; i++){
				list[i].stamina += 3;
				if(list[i].stamina > list[i].fullStamina)
					list[i].stamina = list[i].fullStamina;
			}
		}

		battleOrder = (battleOrder + 1) % 2;
		var set = (battleOrder == 0) ? allies : enemies;

		var pickNext = lastCharacterParty[battleOrder] == undefined;
		for(var i = 0; i <= set.length * 3; i++){
			var char = set[i % set.length];
			if(char.health <= 0) continue;
			if(pickNext) { currentCharacter = char; break; }
			if(char == lastCharacterParty[battleOrder]){
				pickNext = true;
			}
		}
		if(currentCharacter == lastCharacter){
			currentCharacter = undefined;
		}

		lastCharacterParty[battleOrder] = currentCharacter;

		battleState == 0;
		if(battleOrder == 1){
			setTimeout(function(){
				pickBestAction(currentCharacter);
			}, 1000);
		}
	}

	var characterChanged = currentCharacter != lastCharacter;
	lastCharacter = currentCharacter;

	var actionChanged = characterChanged || selectedAction != lastAction;
	lastAction = selectedAction;

	if(characterChanged){
		$("#BattleActions").empty();
	}
	if(actionChanged){
		$("#BattleTargets").empty();
	}

	if(selectedAction === undefined) { battleState = 0; selectedTarget = undefined; }
	if(battleState == 1){
		if(selectedAction.damage > 0){
			if(enemies.length <= 1){
				selectedTarget = enemies[0];
			}
		}
		if(selectedAction.selfOnly)
			selectedTarget = currentCharacter;
		
		if(selectedTarget !== undefined || selectedAction.aoe){
			if(selectedAction.aoe){
				selectedTarget = enemies;
			}
			runAction(currentCharacter, selectedAction, selectedTarget);
			selectedAction = undefined;
			selectedTarget = undefined;
		}
	}

	var toPercentage = function(v)
	{
		return (v * 100) + "%";
	};

	var alliesLeft = 0;
	var indicatorPos;
	for(var i = 0; i < allies.length; i++){
		var c = $("#Charally" + i);
		var ally = allies[i];
		if(ally.health > 0) alliesLeft++;
		if(ally == currentCharacter){			
			indicatorPos = c.position();
			indicatorPos.top += c.height() / 2;
			indicatorPos.left -= 10;
			//update the actions
			if(characterChanged){
				for(var j = 0; j < ally.actions.length; j++){
					if(ally.actions[j].condition && !ally.actions[j].condition(ally)) continue;
					$("#BattleActions").append(makeAction(ally.actions[j]));
				}
			}
			if(actionChanged && selectedAction !== undefined){
				var set = (selectedAction.damage > 0) ? enemies : allies;
				for(var j = 0; j < set.length; j++){
					if(set[j].health <= 0) continue;
					$("#BattleTargets").append(makeTarget(set[j]));
				}
			}
		}
		if(c.length == 0) continue;
		c.find(".charHealth").width(toPercentage(ally.health/ally.fullHealth));
		var stamina = c.find(".charStamina");
		var hasRage = stamina.hasClass("rage");
		var staminaVal = ally.stamina;
		if((!!ally.rage) != hasRage){
			stamina.text((rage) ? "RAGE" : "&nbsp;");
			stamina.toggleClass("shake").toggleClass("rage");	
		}
		if(ally.rage) staminaVal = ally.fullStamina;

		stamina.width(toPercentage((ally.health == 0) ? 0 : staminaVal/ally.fullStamina));
	}
	var enemiesLeft = 0;
	for(var i = 0; i < enemies.length; i++){
		var enemy = enemies[i];
		var c = $("#Charenemy" + i);
		if(enemy == currentCharacter){
			indicatorPos = c.position();
			indicatorPos.top += c.height() / 2;
			indicatorPos.left += c.width() + 25;
		}
		if(c.length == 0) continue;
		if(enemy.health > 0) enemiesLeft++;
		c.find(".charHealth").width(toPercentage(enemy.health/enemy.fullHealth));
		c.find(".charStamina").width(toPercentage((enemy.health <= 0) ? 0 : enemy.stamina/enemy.fullStamina));
	}

	if(characterChanged){
		$("#BattleIndicator").css(indicatorPos);
	}

	if(alliesLeft == 0){
		battleDone = true;
		setTimeout(function(){
			battle = false;
			$.each(allies, function(i, ally){
				ally.health = ally.fullHealth;
				ally.stamina = ally.fullStamina;
			});

			showEvent(events[battleScenario.fail]);
		}, 1000);
	}

	if(enemiesLeft == 0){
		battleDone = true;
		setTimeout(function(){
			battle = false;
			$.each(allies, function(i, ally){
				ally.health = ally.fullHealth;
				ally.stamina = ally.fullStamina;
			});

			showEvent(events[battleScenario.success]);
		}, 1000);
	}
}

function tick()
{
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

var clickedChoice = false;
function showEvent(event)
{
	if(!event) { showEvent(lastEvent); return; }
	if(event.isBattle) {
		if(event.effects){ 
			$.each(event.effects, function(i, effect){ effect();});
		}	
		return;
	}
	console.log("starting event");
	paused = true;
	clickedChoice = false;

	var content = (event.contentFn) ? formatText(event.contentFn()) : event.content;
	$("#EventContent").html(content);
	$("#EventContent").fadeTo(0,0).fadeTo(700, 1.0);
	$("#EventChoices").fadeTo(0,0).fadeTo(1200, 1.0);
	var choices = $("#EventChoices").empty();

	$.each(event.choices, function(i, choice){
		if(choice.condition && !choice.condition()) return true;
		if(choice.text == "") console.log("choice text is empty for ", event);
		var div = $('<div class="event choice">'+choice.text+'</div>').click(function(e){ 
			if(clickedChoice) return;
			clickedChoice = true;
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
		var delay = (event.timedelay === undefined) ? 3000 : event.timedelay;
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
	text = text.replace(/\#([a-zA-Z]*)\#/gi, "<span class='zombie'>$1</span>");
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
		t.timedelay = d;
		return t;
	}

	this.isBattle = false;
	this.battle = function(v){
		t.isBattle = (v===undefined) ? true : v;
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

