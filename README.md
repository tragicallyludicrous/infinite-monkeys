# Infinite Monkeys

#### Video Demo: [https://youtu.be/b7_2IsYTM4U](https://youtu.be/b7_2IsYTM4U)

#### Description: See if you can get lucky enough to produce even one line of Shakespeare with random-text generating monkeys before your computer grinds to a halt. It'll be fun!

#### This repo is a fairly straightforward HTML page (`index.html`) with a much more sprawling game.js attached. Though, to be honest, I'm not experienced enough to know how many lines of code constitute sprawling. Feels like a mess of spaghetti to me, but it's my mess.

#### I've broken the code into some somewhat-helpful headers:

#### `CONSTANTS` up top—these are the values I wanted to start the game with. Many get loaded into variables later (especially `gameState`, the next section) but it made it very convenient to tweak prices and whatnot while I built it and tested it. As I approached the end, I added `DEVELOPER_MODE`, which was even more useful. More on that below.

#### `INITIAL GLOBALS` is next. This is one variable, a dictionary of the various global variables it was helpful to reference throughout. Milestone flags start as false, stats start at 0, and beginning cash/cost of items loads from the constants. Also note `ticks`—several elements in this game required a running clock, so this was a cool bit of architecture to learn about. JS is so verbose it became a bit annoying to keep typing `gameState.***` but it was a good architecture choice in the long run. Kept it clear what was happening at any given moment.

#### `EVENT LISTENERS`. These were the bane of my existence during CS50x—their syntax just never really clicked, and while I eventually got the hang of it here, I think I'll be looking it up for a long time to come. I put them in their own little section so I could ignore them as much as possible. Anyway, here's where I defined the listeners that allowed my HTML buttons to do stuff.

#### `BUYING STUFF` is the first section of gameplay-specific logic. Each function here debits the `gameState.cash` account and creates objects with their own properties, before pushing them to the grid with `spawn()`. After creating monkeyPacks and monkeyFarms, I did a big refactor and combined their purchase into one `buyMonkeyThing(thing, size)` function. Probably could fit regular old monkeys in there too, but their stats are slightly different and I wanted to move on.

#### `HELPERS` — you know, just kinda random functions that help with other ones. `getRandomHighlightColor` was lifted straight from Google, and helps differentiate autoClickers. `passageFormatter` strips unnecessary characters from user-inputted passages. `randomObject` helps autoClickers target their next button—this one took a lot of coaching from my learning-mode AI tutor. Some more interesting JS syntax with the `...`s, `filter`, `map`, etc. `score()` is super important to the game, and includes the logic for streaks as well as payouts. `secondsPerTick` helps with timing calcs elsewhere. `payoutLog` helps keep track of payouts which is useful for `cashPerSec` (a helper for a helper!). `yearFormatter` is basically ripped from Universal Paperclips' source code and along with `ETAToString` helps make things more human readable. `monkeyProb` was some interesting math helping figure out the passage probability of more intelligent monkeys.

#### `MONKEY LOGIC`—one of the beefier sections. `monkeyName` builds a random name out of adjectives and nouns from `monkeynames.js`. I built it robust enough to handle tens of thousands of monkeys, but I don't think anyone has a CPU fast enough for that in the game's current state. `spawn()` takes the objects we spawn in the `buy` functions above and builds them in the DOM. A couple eventListeners snuck in down here, the cheeky bastards. Not sure why `updateCard` exists separate from `renderCard`, but at one point it made sense. `renderCard` was a crazy chimera of HTML-within-JS that has to have a better way.

#### `objectType` probably deserves its own section. First you pass the object that has to attempt to type a passage. It disables the button, establishes some variables, captures the old high score, then starts its outer loop—one `setInterval` per `thread`—that is, how many monkeys the object has. It either generates a letter OR, if it has intelligence bonuses, rolls to see if it gets the letter right by default. We append that letter to its output and rerender the card, once per letter so we can watch it type. Once it's done, we `score` it, compare it to the previous high scores (both for the monkey and the game), and write the passage to `gameState.bestPassage` if it's the best one yet.

#### `AUTOCLICKER LOGIC` was fun to write. I had to find ways to determine if its target was available to click, if another autoclicker had already targeted it, then send it to the type button with another inscrutable bit of JS syntax, `getBoundingClientRect()`. Some references here to autoClickers having their own speed, but it never felt like they needed to be faster or slower. Maybe in future versions. `runAutoClickers` is what we call in the main loop to keep these going every tick.

#### `UNLOCK FLAGS` sends notifications when milestones/unlocks happen. Leans heavily on `hudNotify` which is described later.

#### `UI UPDATES` is three big functions that run every tick to keep the UI fresh. `updateStats` refreshes global stats. `buttonUpdate` makes sure buttons are greyed out/available depending on cash reserves/unlock flags. And `checkWin` checks to see if our win condition has been met, and if so gives us our win screen.

#### `POPUP NOTIFICATIONS` felt like a huge achievement for someone intimidated by the interplay between JS and HTML. I learned about `toast`s and how to attach them to wrappers so we could get monkey-level notifications for that super-addicting gameplay.

#### `DEV MODE` helped a lot once the game got too long to play through in a minute or two—it would have been super annoying to debug the later stages if I had to earn every monkey from scratch. This let me spawn entities for free.

#### and of course, `MAIN LOOP`. Just threw in some eventListeners to activate the `DEV MODE` buttons spawned above, and then wrote the very simple logic that repeats five big functions every tick. Phew!
