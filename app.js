const canvas = document.getElementById('canvas');
const SCREEN_WIDTH = 720;
const SCREEN_HEIGHT = 480;
const FOV = 70;
const RAY_SPEED = 0.01;
const RAY_SPEED_ACCURACY = 0.005;
const SENSITIVITY = 4;
const WALL_SCALE = SCREEN_HEIGHT/90;
const PLAYER_SPEED = 0.2;
const MIN_WALL_DISTANCE = 0.5;
const PIXEL_DENSITY = 1;

const slowRendering = false;

canvas.height = SCREEN_HEIGHT;
canvas.width = SCREEN_WIDTH;
canvas.style.background = "whitesmoke";
let context = canvas.getContext("2d");

//things related to images and textures
const texture_size = 64;
const wall_texture_path = "images/walls/wall_textures.png"
const walls = document.createElement('img');
walls.src = wall_texture_path;
const props_texture_path = "images/props/props_textures.png";
const props = document.createElement('img');
props.src = props_texture_path;

let map = new Array(64);

let playerX = 30.0;
let playerY = 57.5;
let playerDir = 0;

class Color {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = (alpha!==undefined)? alpha: 100;
        this.color = "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", 100)";
    }
}

class Line {
    constructor(x, distance, tileType, tx, ty) {
        this.x = x;
        this.distance = distance;
        this.tileType = (tileType!==undefined)? tileType: "###";
        this.tx = tx;
        this.ty = ty;
    }
}

class Sprite {
    constructor(sx, sy, type) {
        this.sx = sx;
        this.sy = sy;
        this.type = (type!==undefined)? type: "###";
    }
}

let sprites = new Array(1);
sprites[0] = new Sprite(32, 34, "");

let lineList = [new Line(0,0)];
let orderedLineList = [new Line(-1,0), new Line(-1,0), new Line(-1,0)];



function addLineToRenderer(line) {
    let added = false;
    // for (let i = 0; i < orderedLineList.length; i++) {
    //     if (line.distance > orderedLineList[i].distance) {
    //         orderedLineList.splice(i, 0, line)
    //         added = true;
    //     }
    // }
    if (!added) {
        orderedLineList.push(line);
    }
}



function castRay(angle, x) {
    let rad = angle * Math.PI/180;
    let playerRad = playerDir * Math.PI/180;
    let posX = playerX;
    let posY = playerY;

    // 0-90     + +
    // 90-180   - +
    // 180-270  - -
    // 270-360  + -
    let vectorX = Math.cos(rad);
    let vectorY = Math.sin(rad);

    let collision = false;
    while (!collision){
        posX += vectorX * RAY_SPEED;
        posY += vectorY * RAY_SPEED;
        if (map[Math.floor(posX)][Math.floor(posY)] !== "   "
            || Math.floor(posX) === map[0].length
            || Math.floor(posX) === 0
            || Math.floor(posY) === map.length
            || Math.floor(posY) === 0){
            collision = true;
        }
    }
    let tileType = map[Math.floor(posX)][Math.floor(posY)];
    while (collision) {
        posX -= vectorX * RAY_SPEED_ACCURACY;
        posY -= vectorY * RAY_SPEED_ACCURACY;
        if (map[Math.floor(posX)][Math.floor(posY)] === "   "
            && Math.floor(posX) !== map[0].length
            && Math.floor(posX) !== 0
            && Math.floor(posY) !== map.length
            && Math.floor(posY) !== 0){
            collision = false;
        }
    }

    let distance = Math.sqrt(Math.pow(playerX - posX, 2) + Math.pow(playerY - posY ,2));
    distance = distance * Math.cos(playerRad - rad);


    if (posX > 0.99) posX = Math.abs((posX+0.01) % 1);
    else posX = Math.abs(posX % 1);
    if (posY > 0.99) posY = Math.abs((posY+0.01) % 1);
    else posY = Math.abs(posY % 1);


    addLineToRenderer(new Line(x, distance, tileType, posX, posY));
}

function castRays(){
    orderedLineList = [new Line(-1,0)];
    for (let i = 0; i < SCREEN_WIDTH; i+=PIXEL_DENSITY){

        let angle = playerDir - FOV/2 + i*FOV/SCREEN_WIDTH;
        castRay(angle, i);
    }
}

function renderLinesOnCanvas() {
    for (let i = 0; i < orderedLineList.length; i++) {
        if (slowRendering) {
            setTimeout(() => {drawLine(orderedLineList[i],context)}, 10*i);
        }
        else {
            drawLine(orderedLineList[i],context);
        }
    }
}

function drawLine(line, context){
    let x = line.x;
    let distance = line.distance;
    let blockType = line.tileType;

    let hue = 1 / ( (distance*0.4<1)? 1: distance*0.4 );

    let textureX = 0;
    let textureY = 0;
    if (blockType === "#NR"){
        textureX = 128;
        textureY = 128;
    }
    if (blockType === "#NA"){
        textureX = 256;
        textureY = 128;
    }
    else if (blockType === "#BR"){
        textureX = 256;
        textureY = 192;
    }
    else if (blockType === "#BE"){
        textureX = 0;
        textureY = 192;
    }
    else if (blockType === "#BH"){
        textureX = 128;
        textureY = 192;
    }
    else if (blockType === "#GR"){
        textureX = 0;
        textureY = 0;
    }
    else if (blockType === "#GA"){
        textureX = 128;
        textureY = 0;
    }
    else if (blockType === "#CS"){
        textureX = 0;
        textureY = 128;
    }
    else if (blockType === "#CE"){
        textureX = 128;
        textureY = 64;
    }
    else if (blockType === "#GE"){
        textureX = 256;
        textureY = 64;
    }
    else if (blockType === "#GH"){
        textureX = 0;
        textureY = 64;
    }
    else if (blockType === "#GS"){
        textureX = 256;
        textureY = 0;
    }

    let texture_offset;
    if (line.tx > line.ty) {
        texture_offset = line.tx;
        textureX += 64;
    }
    else {
        texture_offset = line.ty
    }

    let height = 100/distance;
    context.drawImage(walls, textureX + Math.min((texture_size*texture_offset),63), textureY, 1, texture_size, (x+1), (SCREEN_HEIGHT/2-(height/2)*WALL_SCALE), 1, height*WALL_SCALE);
}

function drawSprite(sprite, context) {
    //set up the correct sprite texture
    let textureX = 0;
    let textureY = 128 + 1;
    let tw = 128; //texture width
    let th = 128; //texture height

    //setup for drawing a sprite
    let playerRad = playerDir * Math.PI/180;
    let vx = sprite.sx - playerX;
    let vy = sprite.sy - playerY;

    let x = vx;
    let y = vy;

    //"rotate" the view towards the sprite
    vx = x * Math.cos(playerRad) - y * Math.sin(playerRad);
    vy = x * Math.sin(playerRad) + y * Math.cos(playerRad);

    let distance = vy;
    let height = 100/distance;

    context.drawImage(props, textureX, textureY, tw, th, x, SCREEN_HEIGHT/2-height/2, height, height);
}

function drawFloor() {
    /*
    // Create linear gradient
    const grad= context.createLinearGradient(0,0, 0,SCREEN_HEIGHT);
    grad.addColorStop(0, "darkgray");
    grad.addColorStop(0.6, "gray")
    grad.addColorStop(1, "white");
    */

    const grad = "rgb(116 116 116)";

// Fill rectangle with gradient
    context.fillStyle = grad;
    context.fillRect(0,SCREEN_HEIGHT/2, SCREEN_WIDTH,SCREEN_HEIGHT/2);

}
function drawCeiling() {

    /*
    // Create linear gradient
    const grad= context.createLinearGradient(0,0, 0,SCREEN_HEIGHT/2);
    grad.addColorStop(0, "lightblue");
    grad.addColorStop(1, "teal");
    */
    //wolfenstein 3d ceiling
    const grad = "rgb(59 59 59)";

    // Fill rectangle with gradient
    context.fillStyle = grad;
    context.fillRect(0,0, SCREEN_WIDTH,SCREEN_HEIGHT/2);

}

document.onkeydown = function (e) {
    let rad = playerDir * Math.PI/180;
    let vectorX = Math.cos(rad);
    let vectorY = Math.sin(rad);
    let futureX = 0;
    let futureY = 0;
    switch (e.keyCode) {
        case 37:
            console.log('Left Key pressed!');
            playerDir -= SENSITIVITY
            playerDir = playerDir % 360;
            break;
        case 38:
            futureX = playerX + MIN_WALL_DISTANCE * vectorY;
            futureY = playerY + MIN_WALL_DISTANCE * vectorY;
            if (map[Math.floor(futureX)][Math.floor(playerY)] === "   "){
                playerX += PLAYER_SPEED * vectorX
            }
            if (map[Math.floor(playerX)][Math.floor(futureY)] === "   "){
                playerY += PLAYER_SPEED * vectorY;
            }
            break;

        case 39:
            console.log('Right Key pressed!');
            playerDir += SENSITIVITY;
            playerDir = playerDir % 360;
            break;
        case 40:
            console.log('Down Key pressed!');
            futureX = playerX - MIN_WALL_DISTANCE * vectorY;
            futureY = playerY - MIN_WALL_DISTANCE * vectorY;
            if (map[Math.floor(futureX)][Math.floor(futureY)] === "   "){
                playerY -= PLAYER_SPEED * vectorY
                playerX -= PLAYER_SPEED * vectorX
            }


            break;
    }
};



//start code here

function updateScreen(){
    castRays();
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawFloor();
    drawCeiling();
    renderLinesOnCanvas();
    drawSprite(sprites[0], context)
}




map = mapArray;
if (slowRendering){
    setInterval(updateScreen, 7200)
}
else {
    setInterval(updateScreen, 0)
}


