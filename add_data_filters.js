// Made for version 1.1 (rev 4526)
//
// thank you Xander for helping out
//

function is_item_combat_loot(id) {
	/*
	 * checks if the item with id is found through any monster, or dungeon.
	 *
	 * ignores any upgrade paths, crates, or similar
	 * activates lucky herb potion
	 *
	 */

	if (items[id].ignoreCompletion === true) return false; // Ignore non-completion items

	//	524 || 525 || 526  == Pigtayle, Poraxx and Barrantoe
	if (items.filter(x => x.type === 'Seeds' && x.tier === 'Herb').map(x => x["grownItemID"]).includes(id)) return true; // Lucky Herb potion: seeds give their herbs

	if (id === 646) return true // Signet Ring half (b)

	for (let i=0; i<MONSTERS.length; i++) {
		if(id === MONSTERS[i].bones) return true; // Check for bone drops
		let monster_loot = MONSTERS[i].lootTable;
		for (let j=0; j<monster_loot.length; j++) {
			if (monster_loot[j][0] === id) return true;
		}
	}

	// Check dungeon specific loot, e.g. fire cape, air shard etc.
	for (let i=0; i<DUNGEONS.length; i++) {
		let dungeon_loot = DUNGEONS[i].rewards;
		for (let j=0; j<dungeon_loot.length; j++) {
			if (dungeon_loot[j] === id) return true;
		}
	}

	return false;
}

function get_all_combat_drops() {
	/*
	 * returns a list of all items dropped from combat
	 *
	 */
	let found_items = [];
	for (let i=0; i<items.length; i++) {
		if (found_items.indexOf(i) == -1) { // avoid dupes
			if (is_item_combat_loot(i)) {
				found_items[found_items.length] = i;
			}
		}
	}
	return found_items;
}

function get_all_available_items() {
	/*
	 * returns a list of all items a player will be able to get on a (combat-only) character
	 *
	 * this should actually take a list of all items we're starting with, and recursively
	 * open, craft, upgrade, buy, e.g... instead of using hardcoded found_items
	 *
	 * maybe we should create functions for individual sources. would be cleaner
	 */
	let found_items = get_all_combat_drops();
	let new_stuff = true;

	if (SHOP.Materials.length === undefined) return;
	for (let i=0; i<SHOP.Materials.length; i++) {
		if(SHOP.Materials[i].name === "Weird Gloop") continue; // Ignore weird gloop as we cannot get rune essence to buy it.
		let grocery = SHOP.Materials[i];
		for (let j=0; j<grocery.contains.items.length; j++) {
			if (found_items.indexOf(grocery.contains.items[j][0]) == -1) { // avoid dupes
				found_items[found_items.length] = grocery.contains.items[j][0];
			}
		}

	}

	if (SHOP.Slayer.length === undefined) return;
	for (let i=0; i<SHOP.Slayer.length; i++) {
		if(SHOP.Slayer[i].name === "Necromancer Hat") continue;
		if(SHOP.Slayer[i].name === "Necromancer Boots") continue;
		if(SHOP.Slayer[i].name === "Necromancer Bottoms") continue;
		if(SHOP.Slayer[i].name === "Necromancer Robes") continue; // These all have a Summoning requirement

		let grocery = SHOP.Slayer[i];
		for (let j=0; j<grocery.contains.items.length; j++) {
			if (found_items.indexOf(grocery.contains.items[j][0]) == -1) { // avoid dupes
				found_items[found_items.length] = grocery.contains.items[j][0];
			}
		}
	}


	if (SHOP.Gloves.length === undefined) return;
	for (let i=0; i<SHOP.Gloves.length; i++) {
		let grocery = SHOP.Gloves[i];
		for (let j=0; j<grocery.contains.items.length; j++) {
			if (found_items.indexOf(grocery.contains.items[j][0]) == -1) { // avoid dupes
				found_items[found_items.length] = grocery.contains.items[j][0];
			}
		}
	}
	if (SHOP.Skillcapes.length === undefined) return;
	for (let i=0; i<SHOP.Skillcapes.length; i++) {
		let cape = SHOP.Skillcapes[i];
		let skillreqs = cape.unlockRequirements.skillLevel;
		if (skillreqs === undefined) {
			continue;  // completion cape has no skillLevel, but completionPercentage=100
		}
		let ok_skills = [ "Attack", "Strength", "Defence", "Hitpoints", "Ranged", "Magic", "Prayer", "Slayer" ];
		let qualified = true;
		for (let j=0; j<skillreqs.length; j++) {
			if (ok_skills.indexOf(Skills[skillreqs[j][0]]) == -1) {
				qualified = false;
			}
		}
		if (!(qualified)) {
			continue;
		}

		for (let j=0; j<cape.contains.items.length; j++) {
			if (found_items.indexOf(cape.contains.items[j][0]) == -1) { // avoid dupes
				found_items[found_items.length] = cape.contains.items[j][0];
			}
		}
	}


	while (new_stuff) { // this will recursively open and craft chests
		new_stuff = false;
		// buying stuff from shop
		// opening all chests
		for (let i=0; i<found_items.length; i++) {
			if (items[found_items[i]].canOpen) {
				let dt = items[found_items[i]].dropTable;
				for (let j=0; j<dt.length; j++) {
					if (found_items.indexOf(dt[j][0]) == -1) { // avoid dupes
						found_items[found_items.length] = dt[j][0];
						new_stuff = true;
					}
				}
			}
		}

		// going through all craftable items
		for (let i=0; i<items.length; i++) {
			if (items[i].itemsRequired !== undefined) {
				let qualified = true;
				let ingredients = items[i].itemsRequired;
				for (let j=0; (j<ingredients.length) && (qualified); j++) {
					if (found_items.indexOf(ingredients[j][0]) == -1)
						qualified = false;  // missing an ingredient
				}
				if (qualified) {
					if (found_items.indexOf(i) == -1) { // avoid dupes
						found_items[found_items.length] = i;
						new_stuff = true;
					}
				}
			}
		}
	}

	return found_items;
}

function is_item_skill_available(item_id) {
	let found_items = get_all_available_items();  // TODO: stop this dumb generation by caching the found_items once for all items, instead of this cringe per-item list-creation
	return (found_items.indexOf(item_id) >= 0);
}

function is_item_level_available(item_id) {
	return is_item_skill_available(item_id);  // TODO: actually create some implementation for this
}

function update_all_combat_data() {
	for (let i=0; i<items.length;i++) {
		items[i].isCombatDrop = is_item_combat_loot(i);
		items[i].isItemAvailable = is_item_skill_available(i);
		items[i].isItemAvailableNow = is_item_level_available(i);
	}
}


var add_filter_button = () => {
	// TODO: this should instead just toggle a setting for enabling and disabling filter, as used in combat_log_patching.js
	/*
		let enable_isSkillAvailable_filter = true;
		let enable_isLevelAvailable_filter = true;
	*/

	if ($("#completion-log-2") && $("#completion-log-2").find(".col-12")[4]) {
		itemlog = $("#completion-log-2");
		buttonRow = itemlog.find(".col-12")[4];
		monsterLootButton = $("<button>", {
			id: "complog_monster_loot",
		 	class: "btn btn-sm btn-info m-1",
		 	role: "button",
		 	onclick: "complog_filter_monster_loot();",
		 	text: "Monster loot"
		});
		cdoButton = $("<button>", {
			id: "complog_cdo",
		 	class: "btn btn-sm btn-info m-1",
		 	role: "button",
		 	onclick: "complog_filter_co_available();",
		 	text: "All Combat Drops"
		});
		if ($("#complog_cdo").length === 0) {
			monsterLootButton.appendTo(buttonRow);
			cdoButton.appendTo(buttonRow);
			let cdo_counter = complog_filter_co_available().length;
			$("#item-log-comp-count").append(' / <span id="item-log-cdo-count">' + cdo_counter + '</span>');
		}
	}
};

console.log("[combatlog/add_data_filter] Loading...");
setTimeout( () => setInterval(update_all_combat_data, 1000), 1000 );
console.log("[combatlog/add_data_filter] Done!");
