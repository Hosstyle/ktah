/**
 * score-screen-display.js
 * 
 * Script for dealing with display elements in the
 * score screen.
 */

$(function () {
  var userName = $("#userName").attr("data"),
      scoreList = $("#room-options");
  
  // First, clear the score report space
  scoreList.html("");
  
  // Next, populate the scores
  for (var i = 0; i < data.length; i++) {
    var currentPlayer = data[i],
        playerAccent = "",
        playerStatus = "room-player-list";
    
    // Accent the current player in the lobby
    if (currentPlayer.name === userName) {
      playerAccent = 'class="currentPlayer"';
    }
    
    // Add the HTML to the list area
    scoreList.append('<div class="' + playerStatus + '"><strong ' + playerAccent + '>'
    + currentPlayer.name + ':</strong> ' + currentPlayer.pointsEarned 
    + '<span class="class-selection"><img class="class-icon class-selected" src="../assets/icons/'
    + currentPlayer.character + 'Icon.png"></img></span></div>');
  }
});