const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

context.fillStyle = "black";
context.fillRect(0, 0, width, height);

let gameOver = false;

let moveUp = false;
let moveDown = false;
let playerMoveSpeed = 6;
let enemyMoveSpeed = 5;

//score
let currentScore = 0;
let highScore = 0;

let enemies = [];
let player;

let showCollisionDistances = true;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
})

//#region classes

class Enemy{

    countedAsPoint = false;

    constructor(x, y, radius){
        this.x = x;
        this.y = y;        
        this.radius = radius;
    }

    draw = () =>{
        context.fillStyle = "white";
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    update = () => {

        //update score
        if(this.x < player.x && !this.countedAsPoint){
            currentScore++
            this.countedAsPoint = true;
        }

        if(this.x < this.radius){
            this.x = canvas.width - this.radius;
            this.countedAsPoint = false;
        }
        else{
            this.x -= enemyMoveSpeed;
        }
    }
}

class Player{

    constructor(x, y, radius){
        this.x = x;
        this.y = y;        
        this.radius = radius;
    }

    draw = () =>{
        if(moveUp){
            if(this.y - this.radius > 0)
                this.y -= playerMoveSpeed;
            else{
                moveUp = false;
            }
        }
        if(moveDown){
            if(this.y + this.radius < canvas.height)
                this.y += playerMoveSpeed;
            else{
                moveDown = false;
            }
        }
        context.fillStyle = "red";
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
}

//#endregion


const initEnemies = (amount) => {
    enemies = [];
    for(let i = 0; i < amount; i++){

        let enemyIsValid = false;

        do {
            const radius = getRandomRadius();
            const x = getRandomXCoordinate(radius);
            const y = getRandomYCoordinate(radius);

            let enemy = new Enemy(x, y, radius);

            enemyIsValid = isDistanceValid(enemy);
            if(enemyIsValid)
                enemies.push(enemy);
            
        } while (!enemyIsValid);
    }
}

//#region random x/y/radius for enemies

const getRandomRadius = () => {
    const minRadius = 20;
    const maxRaius = 40;

    let radius = minRadius + Math.random() * (maxRaius - minRadius);
    return radius;
}

const getRandomXCoordinate = (radius) => {
    const minX = (canvas.width / 2) + radius;
    const maxX = (canvas.width * 1.5) - radius;

    let x = minX + Math.random() * (maxX - minX);
    return x;
}

const getRandomYCoordinate = (radius) => {
    const minY = radius;
    const maxY = canvas.height - radius;

    let y = minY + Math.random() * (maxY - minY);
    return y;
}

//#endregion

const drawEnemies = () => {
    for(let i = 0; i < enemies.length; i++){
        enemies[i].draw();
    }
}

const updateEnemis = () => {
    for(let i = 0; i < enemies.length; i++){
        enemies[i].update();
    }
}



const isDistanceValid = (enemy) => {

    let distanceIsValid = true;

    let otherEnemies = enemies.filter(i => i != enemy);

        for(let j = 0; j < otherEnemies.length; j++){

            let otherEnemy = otherEnemies[j];

            let firstLocation = {x: enemy.x, y: enemy.y};
            let secondLocation = {x: otherEnemy.x, y: otherEnemy.y};

            let distance = getDistanceBetweenPoints(firstLocation, secondLocation);

            distance -= enemy.radius;
            distance -= otherEnemy.radius

            if(distance < player.radius * 4){
                distanceIsValid = false;
            }
        }

    return distanceIsValid;
}

const getDistanceBetweenPoints = (firstLocation, secondLocation) => {

    let distanceX = Math.pow((firstLocation.x - secondLocation.x), 2);
    let distanceY = Math.pow((firstLocation.y - secondLocation.y), 2);
    return Math.sqrt(distanceX + distanceY);
}

const drawEnemy = (x, y, radius) => {
    context.fillStyle = "white";
    context.beginPath();
    context.arc(x,y, radius, 0, 2 * Math.PI);
    context.fill();
}

const initPlayer = () => {
    const radius = 10;
    const x = canvas.width / 4;
    const y = canvas.height / 2 - radius;

    player = new Player(x, y, radius);
}

const drawPlayer = () => {
    player.draw();
}

//#region Key listeners

document.addEventListener("keydown", (e) =>  {
    if(!gameOver){
        if(e.key === "ArrowUp"){
            moveUp = true;
        }
        if(e.key === "ArrowDown"){
            moveDown = true;
        }
    }
})  

document.addEventListener("keyup", (e) =>  {
    if(!gameOver){
        if(e.key === "ArrowUp"){
            moveUp = false;
        }
        if(e.key === "ArrowDown"){
            moveDown = false;
        }
    }
})

document.getElementById("btnShowDistances").addEventListener("click", (e) => {
    showCollisionDistances = !showCollisionDistances;
})

//#endregion

const init = () => {
    moveUp = false;
    moveDown = false;

    currentScore = 0;

    //player
    initPlayer();
    drawPlayer();

    //enemies
    initEnemies(50);
    drawEnemies();
    canShowConfirm = true;
}

const drawCollisionDistance = (distance, firstLocation, secondLocation) => {
    if(distance < canvas.width){

        let color = getColorForCollisionDistance(distance);
        let lineWidth = getLineWidthForCollisionDistance(distance);

        context.beginPath();
        context.moveTo(firstLocation.x, firstLocation.y);
        context.lineTo(secondLocation.x, secondLocation.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();

        //write distance
        context.font = "10px Arial";
        const textLocation = getCollisionTextLocation(firstLocation, secondLocation);
        let distanceTwoDecimal = distance.toFixed(2);
        context.fillStyle = color;
        context.fillText(distanceTwoDecimal, textLocation.x, textLocation.y);
    }
}

const getCollisionTextLocation = (firstLocation, secondLocation) => {

    let shortestX = firstLocation.x > secondLocation.x ? secondLocation.x : firstLocation.x;
    let longestX = firstLocation.x < secondLocation.x ? secondLocation.x : firstLocation.x;

    let shortestY = firstLocation.y > secondLocation.y ? secondLocation.y : firstLocation.y;
    let longestY = firstLocation.y < secondLocation.y ? secondLocation.y : firstLocation.y;

    let distanceX = shortestX + ((longestX - shortestX) / 2);
    let distanceY = shortestY + ((longestY - shortestY) / 2);

    return {x: distanceX, y: distanceY};
}

const getLineWidthForCollisionDistance = (distance) => {
    let lineWidth = 0.3;

    if(distance < canvas.width / 10)
        lineWidth = 1;

    return lineWidth;
}

const getColorForCollisionDistance = (distance) => {

    let color = "green";

    if(distance < canvas.width / 10)
        color = "red";

    return color;
}

const animate = () => {
    
    requestAnimationFrame(animate);

    //clear game
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    gameOver = isPlayerCollision();
    let canShowConfirm = true;

    if(!gameOver){
        drawScene();
        updateScoretable();
    }
    else{
        if(canShowConfirm){
            canShowConfirm = false;
            let tryAgain = confirm(`You scored ${currentScore} points! Wanna try again?`)
            if(tryAgain){
                highScore = currentScore > highScore ? currentScore : highScore;
                init();
            }
        }
    }
}

const isPlayerCollision = () => {

    let isCollision = false;

    for(let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        let playerLocation = {x: player.x, y: player.y};
        let enemyLocation = {x: enemy.x, y: enemy.y};

        let distance = getDistanceBetweenPoints(playerLocation, enemyLocation);

        if(showCollisionDistances)
            drawCollisionDistance(distance, playerLocation, enemyLocation);

        distance -= player.radius
        distance -= enemy.radius;

        if(distance < 0){
            isCollision = true;
        }
    }

    return isCollision;
}

const drawScene = () => {
    updateEnemis();
    drawEnemies();
    drawPlayer();
}

const updateScoretable = () => {
    document.getElementById("currentScore").innerHTML = `Current score: ${currentScore}`;
    document.getElementById("highScore").innerHTML = `Highscore: ${highScore}`;
}

init();
animate();