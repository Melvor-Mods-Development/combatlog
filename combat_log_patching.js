// Made for version 1.1 (rev 4526)
//
// thank you Xander for helping out
//

/* 
 * we simply keep this function here as a reference, since we're patching it
 *
function melvor_filterItemLog(filter) {
    $('#searchTextbox-items').val('');
    let shouldShow;
    switch (filter) {
    case 0:
        shouldShow = (item,found)=>found || !item.ignoreCompletion;
        break;
    case 1:
        shouldShow = (_,found)=>found;
        break;
    case 2:
        shouldShow = (item,found)=>!found && !item.ignoreCompletion;
        break;
    case 3:
        shouldShow = (item,_)=>(item.namespace == 'melvorD' || item.namespace == 'melvorF') && !item.ignoreCompletion;
        break;
    case 4:
        shouldShow = (item,_)=>item.namespace == 'melvorTotH' && !item.ignoreCompletion;
        break;
    }
    game.items.forEach((item)=>{
        const element = completionLogMenu.items.get(item);
        if (element === undefined)
            return;
        const found = game.stats.itemFindCount(item) > 0;
        if (shouldShow(item, found))
            showElement(element);
        else
            hideElement(element);
    });
};
 *
 */

function melvor_shouldShow(item, found) {
    let shouldShow;
    switch (filter) {
		case 0:
			shouldShow = (item,found)=>found || !item.ignoreCompletion;
			break;
		case 1:
			shouldShow = (_,found)=>found;
			break;
		case 2:
			shouldShow = (item,found)=>!found && !item.ignoreCompletion;
			break;
		case 3:
			shouldShow = (item,_)=>(item.namespace == 'melvorD' || item.namespace == 'melvorF') && !item.ignoreCompletion;
			break;
		case 4:
			shouldShow = (item,_)=>item.namespace == 'melvorTotH' && !item.ignoreCompletion;
			break;
	}
	return shouldShow;
}

function filterItemLog_isSkillAvailable(filter, item) {
	// Not Yet Implemented
}

function filterItemLog_isLevelAvailable(filter, item) {
	// Not Yet Implemented
}

/* patching the functions */
function shouldShow(filter, item) {

	let enable_isSkillAvailable_filter = true;
	let enable_isLevelAvailable_filter = true;
	
	// we are not adding anything which isn't already visible by melvor
	let would_melvor_show_item = melvor_shouldShow(item, found);
	if (!(would_melvor_show_item)) {
		return false;
	}

	// we can return early, since we won't ever have levels for locked skills
	let isSkillAvailable = filterItemLog_isSkillAvailable(filter, item);
	if (enable_isSkillAvailable_filter) {
		return isSkillAvailable;
	}

	let isLevelAvailable = filterItemLog_isLevelAvailable(filter, item);
	if (enable_isLevelAvailable_filter) {
		return isLevelAvailable;
	}

	return true;
}

window.filterItemLog = function(filter) {
	let use_melvor_default = true;
    $('#searchTextbox-items').val('');
	
	if (use_melvor_default) {
		melvor_filterItemLogFilter(filter);
		return;
	}

	let shouldShow;
    game.items.forEach((item)=>{
        const element = completionLogMenu.items.get(item);
        if (element === undefined)
            return;
        const found = game.stats.itemFindCount(item) > 0;
        if (shouldShow(item, found))
            showElement(element);
        else
            hideElement(element);
    });
}


/* startup */

function entry_point() {
	// do we need to do anything when we load?
}

console.log("[combatlog/combat_log_patching] Loading...");
setTimeout( () => setInterval(entry_point, 1000), 1000 );
console.log("[combatlog/combat_log_patching] Done!");
