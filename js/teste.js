var willWatchMovie = function(ticketCost, isActionFlick) { 
    if (isActionFlick === true && ticketCost > 5) {
        return "no";
    } else if (ticketCost < 15) {
        return "yes";
    } else {
       return "maybe";
    }
};