var rows = 50;
var cols = 50;

var playing = false;

var timer;
var reproductionTime = 100; // the "sleep" time

// we need a model
var grid = new Array(rows);
var nextGrid = new Array(rows);

function initializeGrids() {
   for (var i = 0; i < rows; i++) {
      grid[i] = new Array(cols);
      nextGrid[i] = new Array(cols);
   }
}

function resetGrids() {
   for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
         grid[i][j] = 0;
         nextGrid[i][j] = 0;
      }
   }
}

function copyAndResetGrid() {
   for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
         grid[i][j] = nextGrid[i][j];
         nextGrid[i][j] = 0;
      }
   }
}

// end model

// initialize
function initialize() {
   createTable();
   initializeGrids();
   resetGrids();
   setupControlButtons();
}

// lay out the board
function createTable() {
   var gridContainer = document.getElementById("gridContainer");

   if (!gridContainer) {
      // throw error
      console.error("Problem: no div for the grid table!");
   }

   var table = document.createElement("table");

    for(var i = 0; i < rows; i++) {
      var tr = document.createElement("tr");

      for(var j = 0; j < cols; j++) {
         var cell = document.createElement("td");
         cell.setAttribute("id", i + "_" + j);
         cell.setAttribute("class", "dead");
         cell.onclick = cellClickHandler;

         tr.appendChild(cell);
      }

      table.appendChild(tr);
    }

    gridContainer.appendChild(table);
}

function cellClickHandler() {
   var rowcol = this.id.split("_");
   var row = rowcol[0];
   var col = rowcol[1];

   var classes = this.getAttribute("class");

   if (classes.indexOf("live") > -1) {
      this.setAttribute("class", "dead");
      grid[row][col] = 0;
   } else {
      this.setAttribute("class", "live");
      grid[row][col] = 1;
   }
}

function updateView() {
   for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
         var cell = document.getElementById(i + "_" +j);

         if (grid[i][j] == 0) {
            cell.setAttribute("class", "dead");
         } else {
            cell.setAttribute("class", "live");
         }
      }
   }
}

function setupControlButtons() {

   var startButton = document.getElementById("start");
   startButton.onclick = startButtonHandler;

   var clearButton = document.getElementById("clear");
   clearButton.onclick = clearButtonHandler;

   var randomButton = document.getElementById("random");
   randomButton.onclick = randomButtonHandler;
}

function randomButtonHandler() {
   // we don't want people randomly changing the game while it's playing
   if (playing) return;

   clearButtonHandler();

   for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
         var isLive = Math.round(Math.random());

         if (isLive == 1) {
            var cell = document.getElementById(i + "_" + j);
            cell.setAttribute("class", "live");
            grid[i][j] = 1;
         }
      }
   }
}

function clearButtonHandler() {
   console.log("Clear the game: stop playing, clear the grid");
   playing = false;
   var startButton = document.getElementById("start");
   startButton.innerHTML = "start";

   clearTimeout(timer); // this stops the game

   var cellsList = document.getElementsByClassName("live");
   var cells = [];

   for (var i = 0; i < cellsList.length; i++) {
      cells.push(cellsList[i]);
   }

   for (var i = 0; i < cells.length; i++) {
      cells[i].setAttribute("class", "dead");
   }

   resetGrids();
}

function startButtonHandler() {

   if (playing) {
      console.log("Pause the game");
      playing = false;
      this.innerHTML = "continue";
      clearTimeout(timer);
   } else {
      console.log("Continue the game"); // isn't it really contine OR start?
      playing = true;
      this.innerHTML = "pause";
      play();
   }
}

function play() {
   console.log("Play the game");
   computeNextGen();

   if (playing) {
      timer = setTimeout(play, reproductionTime);
   }
}

// computes the next state of board, nextGen, and then updates view
function computeNextGen() {
   for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
         applyRules(i, j);
      }
   }

   // copy nextGrid to grid and reset nextGrid
   copyAndResetGrid();
   // copy all 1 values to "live" in the view's table
   updateView();
}
/* Rules:
   1. Any live cell with fewer than 2 live neighbors dies, as if caused by under-population
   2. Any live cell with 2 or 3 live neighbors lives on to the next generation
   3. Any live cell with more than 3 live neighbors dies, as if by over-crowding
   4. Any dead cell with exactly 3 live neighbors becomes a live cell, as if by reproduction */
function applyRules(row, col) {
   var numNeighbors = countNeighbors(row, col);

   if (grid[row][col] == 1) {
      if (numNeighbors < 2) {
         nextGrid[row][col] = 0;
      } else if (numNeighbors == 2 || numNeighbors == 3) {
         nextGrid[row][col] = 1;
      } else if (numNeighbors > 3) {
         nextGrid[row][col] = 0;
      }
   } else if (grid[row][col] == 0) {
      if (numNeighbors == 3) {
         nextGrid[row][col] = 1;
      }
   }
}

function countNeighbors(row, col) {
   var count = 0;

   if (row-1 >= 0) {
      if (grid[row-1][col] == 1) count++;
   }
   if (row-1 >= 0 && col-1 >= 0) {
      if (grid[row-1][col-1] == 1) count++;
   }
   if (row-1 >= 0 && col+1 < cols) {
      if (grid[row-1][col+1] == 1) count++;
   }
   if (col-1 >= 0) {
      if (grid[row][col-1] == 1) count++;
   }
   if (col+1 < cols) {
      if (grid[row][col+1] == 1) count++;
   }
   if (row+1 < rows) {
      if (grid[row+1][col] == 1) count++;
   }
   if (row+1 < rows && col-1 >=0) {
      if (grid[row+1][col-1] == 1) count++;
   }
   if (row+1 < rows && col+1 < cols) {
      if (grid[row+1][col+1] == 1) count++;
   }

   return count;
}

// start everything
window.onload = initialize;