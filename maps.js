//RULES FOR MAKING MAPS
//- each tile has 3 characters
//- a leading # character means there is a solid block there

let mapArray = new Array(64);
for (let i = 0; i < mapArray.length; i++) {
    mapArray[i] = new Array(64);
}

const mapCanvas = document.createElement("canvas")
let mapctx = null;
const mapImage = new Image()

let mapWidth = 64;
let mapHeight = 64;

mapImage.src = "images/maps/floor1.png";
mapImage.onload = function () {

    // mapWidth = mapImage.width;
    // mapHeight = mapImage.height;
    mapCanvas.width = mapWidth;
    mapCanvas.height = mapHeight;
    mapctx = mapCanvas.getContext("2d");

    mapctx.drawImage(mapImage, 0, 0);
    let mapData = mapctx.getImageData(0, 0, mapWidth, mapHeight);

    for (let row = 0; row < mapCanvas.width; row++) {
        for (let col = 0; col < mapCanvas.height; col++) {
            let tileData = mapctx.getImageData(row, col, 1, 1);
            let data = tileData.data;
            if (data[0] === 255 && data[1] === 255 && data[2] === 255) {
                mapArray[row][col] = "   ";
            }
            else if (data[0] === 128 && data[1] === 128 && data[2] === 128) {
                mapArray[row][col] = "#GR"; //gray regular
            }
            else if (data[0] === 100 && data[1] === 100 && data[2] === 100) {
                mapArray[row][col] = "#GA"; //gray alternate
            }
            else if (data[0] === 63 && data[1] === 72 && data[2] === 204) {
                mapArray[row][col] = "#NR"; //niebieski (blue) regular
            }
            else if (data[0] === 50 && data[1] === 130 && data[2] === 246) {
                mapArray[row][col] = "#NA"; //niebieski (blue) alternate
            }
            else if (data[0] === 185 && data[1] === 122 && data[2] === 87) {
                mapArray[row][col] = "#BR";//brown regular
            }
            else if (data[0] === 255 && data[1] === 127 && data[2] === 39) {
                mapArray[row][col] = "#BE"; //brown eagle
            }
            else if (data[0] === 135 && data[1] === 86 && data[2] === 26) {
                mapArray[row][col] = "#BH"; //brown eagle
            }
            else if (data[0] === 0 && data[1] === 12 && data[2] === 123) {
                mapArray[row][col] = "#CS"; //cell skeleton
            }
            else if (data[0] === 0 && data[1] === 18 && data[2] === 154) {
                mapArray[row][col] = "#CE"; //cell empty
            }
            else if (data[0] === 100 && data[1] === 100 && data[2] === 200) {
                mapArray[row][col] = "#GE"; //gray eagle
            }
            else if (data[0] === 100 && data[1] === 200 && data[2] === 100) {
                mapArray[row][col] = "#GH"; //gray hitler
            }
            else if (data[0] === 200 && data[1] === 100 && data[2] === 100) {
                mapArray[row][col] = "#GS"; //gray swastika
            }

            else {
                mapArray[row][col] = "###";
            }
        }
    }
}


