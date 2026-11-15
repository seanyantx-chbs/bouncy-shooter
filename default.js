var paused = false;
var clickable = false;
var start = false;
var stop = true;
var time = 0;
var wave = 0;
var mouseClicked = false;
var buttonClicked = 0;
const WIDTH = 400;
var enemySpeed = 10;
const HEIGHT = 400;
const HALFW = WIDTH/2;
const HALFH = HEIGHT/2;
const SLOWSPEED = 10;
const ENEMYHP = 100;
const pi = 3.14159265;
var speed = 0.5;
var enemySize = 20;

var plyr = {
    x: HALFW,
    y: HALFH,
    r: 20,
    col: [188, 231, 177],
    rot: 0,
    cd: 0,
    hp: 100,
};
var plyrUpgrds = {
    bulletSpeed: 4,
    fireRate: 20,
    bulletCount: 1,
    bounces: 3,
    options: 2,
    damage: 1,
    splitting: 1,
}

function setup(){
    createCanvas(WIDTH, HEIGHT);
}

class Circle{
    constructor(x,y,r,col){
        this.x = x;
        this.y = y;
        this.r = r;
        this.col = col;
    }
    draw(){
        fill(this.col[0],this.col[1],this.col[2]);
        strokeWeight(2);
        ellipse(this.x,this.y,this.r,this.r);
    }
}
class Projectile extends Circle{
    constructor(x,y,r,vx,vy,col){
        super(x,y,r);
        this.vx = vx;
        this.vy = vy;
        this.col = col;
        this.hp = plyrUpgrds.bounces;
    }
    
}
class Enemy extends Circle{
    constructor(x,y,r,t,col,hp){
        super(x,y,r);
        this.t = t;
        this.col = col;
        this.hp = hp;
    }
    
}
class Upgrade{
    static number = 0;
    constructor(name,desc,rarity){
        this.name = name;
        this.desc = desc;
        this.rarity = rarity;
        this.id = Upgrade.number;
        Upgrade.number ++;
    }
}

var choices = [];
var upgrades = [
    new Upgrade("faster firing","15% faster firing","common"),
    new Upgrade("health","fully heal","uncommon"),
    new Upgrade("heavy hitting","15% more damage","common"),
    new Upgrade("reroll","reroll choices","uncommon"),
    new Upgrade("studying","+1 choice per wave","rare"),
    new Upgrade("bonus shots","shoot another bullet","uncommon"),
    new Upgrade("splitting","chance to bullet split on impact","rare"),
    new Upgrade("obesity epidemic","enemies are 15% larger","common"),
    
    new Upgrade("health","heal","common"),
    new Upgrade("faster firing","30% faster firing","uncommon"),
    new Upgrade("heavy hitting","30% more damage","uncommon"),
    new Upgrade("obesity epidemic","enemies are 30% larger","uncommon"),
    ];
var enemies = [];
var projectiles = [];

function draw() {
    //plyr.hp -= 1;
    if (plyr.hp < 0) {
        start = false;
    }
    time++;
    if (plyr.cd > 0){
        plyr.cd --;
    }
    background(155,155,155);
    
    display();
    if (!start && plyr.hp > 0) {
        background(0, 200, 0);
        textSize(50);
        text("Bouncy Shooter", 20, 40);
        textSize(20);
        text("You are the sheriff of landistan, and must defend the road from the red circles of DOOM. However, you have Cervical Dystonia, and can only fire to the right, so you must do trick shots off of rocks from a nearby avalance that you also don't want on the road. Also, you're the main character and gain powers from doing this. ", 20, 80, 300);
        if (mouseIsPressed){
            start = true;
        }
    } else if (!start) {
        background(255, 0, 0);
        textSize(50);
        text("You lose", 100, 100);
        
    }
    else{
        if (!paused){
            if (plyr.cd > 0){
                for (var i = 0; i < 1/speed; i++){
                    tick();
                }
            }
            else{
                speed /= SLOWSPEED;
                for (var i = 0; i < 1/speed/SLOWSPEED; i++){
                    tick();
                }
                speed *= SLOWSPEED;
            }
        }
        if (paused){
            pauseMenu();
        }
    }
};


// checks if a bullet is touching the circle and deflects it
function checkCollisions(e, p, i) {
    var b;
    if (p.vx > 0) {
        b = Math.atan(p.vy/p.vx);
    } else {
        b = Math.atan(p.vy/p.vx) + pi;
    }
    var a;
    if (p.x > e.x) {
        a = Math.atan((p.y-e.y)/(p.x-e.x));
    } else {
        a = Math.atan((p.y-e.y)/(p.x-e.x)) - pi;
    }
    var theta = 2*a - b + pi;
    if (Math.sqrt( (e.x-p.x)**2 + (e.y-p.y)**2) < e.r/2) {
        var s = Math.sqrt(p.vx**2 + p.vy**2);
        e.hp -= 50*plyrUpgrds.damage;
        p.hp -= 1;
        p.vx = s*cos(theta);
        p.vy = s*sin(theta);
        if (plyrUpgrds.splitting != 0 && Math.random()<1/(Math.max(10-plyrUpgrds.splitting,1))){
            var x = Math.random()*200;
            var y = Math.random()*200;
            projectiles.push(new Projectile(e.x, e.y, 1,
                x/(Math.sqrt(x**2 + y**2)) *plyrUpgrds.bulletSpeed,
                y/(Math.sqrt(x**2 + y**2)) *plyrUpgrds.bulletSpeed,
                [255, 255, 0]
                ));
        }
        
    }
    if (e.hp < 0) {
        enemies.splice(i,1);
    }
    if (p.hp < 0) {
        p.x = 1000000;
    }
}

function nextLevel(){
    clickable = false;
    stop = true;
    enemies = [];
    projectiles = [];
    wave ++;
    if (wave != 1){
        paused = true;
    }
    for (var i = 0; i < 20 + (wave**1.5); i++) {
        if (i % (wave+10) < 10){
            enemies.push(new Enemy(WIDTH-50*Math.random(), Math.random() * HEIGHT, enemySize, "deadly", [255, 255, 255], ENEMYHP));
        }
        else{
            enemies.push(new Enemy(50*Math.random(), Math.random() * HEIGHT, enemySize * 2, "deadly", [255, 0, 0], 1));
        }
    }
    rollChoices();
}

function rollChoices(){
    for (var _ = 0; _ < plyrUpgrds.options; _++){
        choices.push(upgrades[Math.floor(Math.random()*upgrades.length)]);
    }
}

function fire(){
    for (var i = 0; i < plyrUpgrds.bulletCount; i ++){
        projectiles.push(new Projectile(HALFW, HALFH, 1,
            ((mouseX-i*5)-HALFW)/(Math.sqrt(((mouseX-i*5)-HALFW)**2 + ((mouseY-i*5)-HALFH)**2)) *plyrUpgrds.bulletSpeed,
            ((mouseY-i*5)-HALFH)/(Math.sqrt(((mouseX-i*5)-HALFW)**2 + ((mouseY-i*5)-HALFH)**2)) *plyrUpgrds.bulletSpeed,
            [255, 255, 0]
            ));
    }
}

function tick(){
    if (mouseIsPressed && plyr.cd <= 0 && mouseX > HALFW + 15){
        plyr.cd = plyrUpgrds.fireRate;
        fire();
    }
    
    for (var j = projectiles.length-1; j >= 0; j--) {
        projectiles[j].x += projectiles[j].vx*speed;
        projectiles[j].y += projectiles[j].vy*speed;
        for (var i = enemies.length-1; i >= 0; i --) {
            checkCollisions(enemies[i], projectiles[j], i);
        }
    }
    for (var i = 0; i < enemies.length; i ++) {
        try{
                if (enemies[i].x >= HALFW){
                    enemies[i].x -= (wave*0.00 + 0.01)*speed*enemySpeed;
                }
                if (enemies[i].x <= HALFW) {
                    enemies[i].x += (0.01)*speed*enemySpeed;
                }
                if (enemies[i].x >= HALFW-enemies[i].r && enemies[i].x <= HALFW+enemies[i].r) {
                    plyr.hp -= 10;
                    enemies.splice(i,1);
                }
                if (enemies[i].y > HALFH){
                    enemies[i].y -= (wave*0.00 + 0.005)*speed*enemySpeed;
                }
                else{
                    enemies[i].y += (0.005)*speed*enemySpeed;
                }
            } catch(error){}
        }
    if (enemies.length === 0) {
        nextLevel();
    }
    
}

function display(){
    fill(64,64,64);
    rect(HALFW-15,-1,30,HEIGHT+2);
    for (var i = 0; i < enemies.length; i ++){
        enemies[i].draw();
    }
    for (var i = 0; i < projectiles.length; i ++){
        projectiles[i].draw();
    }
    fill(plyr.col[0],plyr.col[1],plyr.col[2]);
    ellipse(plyr.x,plyr.y,plyr.r,plyr.r);
    fill(64);
    rect(100,20,200,30);
    fill(0,255,0);
    rect(105,25,190*plyr.hp/100,20);
}

function findButtonClicked(upgradesSX,upgradesSY){
    for (var u = 0; u < choices.length; u++) {
        var r = buttonRect(u);
        if (mouseX > r.x && mouseX < r.x + r.w && mouseY > r.y && mouseY < r.y + r.h) {
            return u;
        }
    }
    return -1;
}
function buttonRect(u) {
   var cols = Math.min(plyrUpgrds.options, 3);
   var rows = Math.ceil(plyrUpgrds.options / 3);
   var gap = 10;
   var areaX = WIDTH / 12 + 15;
   var areaY = HEIGHT / 6 + 15;
   var areaW = WIDTH * 5 / 6 - 30;
   var areaH = HEIGHT * 2 / 3 - 30;
   var w = (areaW - gap * (cols - 1)) / cols;
   var h = (areaH - gap * (rows - 1)) / rows;
   return {
       x: areaX + (w + gap) * (u % 3),
       y: areaY + (h + gap) * Math.floor(u / 3),
       w: w,
       h: h,
   };
}

function pauseMenu(){
    buttonClicked = findButtonClicked();
    fill(0,0,0,100);
    rect(-1,-1,WIDTH+2,HEIGHT+2); // darken the bg
    
    fill(64,64,64);
    rect(WIDTH/12,HEIGHT/6,WIDTH*5/6,HEIGHT*2/3,20); // shop
    fill(255,255,255);
    rect(WIDTH/12+5,HEIGHT/6+5,WIDTH*5/6-10,HEIGHT*2/3-10,20);
    if (!mouseIsPressed){
        clickable = true;
    }
    if (mouseIsPressed && clickable){
        // this means you just let go
        if (findButtonClicked() === buttonClicked && buttonClicked !== -1){
            console.log(choices[buttonClicked].id);
            if (choices[buttonClicked].id === 0){
                plyrUpgrds.fireRate /= 1.15;
            } else if (choices[buttonClicked].id === 1){
                plyr.hp = 100;
            } else if (choices[buttonClicked].id === 2){
                plyrUpgrds.damage *= 1.15;
            } else if (choices[buttonClicked].id === 3){
                rollChoices();
                return;
            } else if (choices[buttonClicked].id === 4){
                plyrUpgrds.options++;
            } else if (choices[buttonClicked].id === 5){
                plyrUpgrds.bulletCount++;
            } else if (choices[buttonClicked].id === 6){
                plyrUpgrds.splitting++;
            } else if (choices[buttonClicked].id === 7){
                enemySize *= 1.15;
                for (var e = 0; e < enemies.length; e ++){
                    enemies[e].r = enemySize;
                }
            } else if (choices[buttonClicked].id === 8){
                plyr.hp += 20;
            } else if (choices[buttonClicked].id === 9){
                plyrUpgrds.fireRate /= 1.3;
            } else if (choices[buttonClicked].id === 10){
                plyrUpgrds.damage *= 1.3;
            } else if (choices[buttonClicked].id === 11){
                enemySize *= 1.3;
                for (var e = 0; e < enemies.length; e ++){
                    enemies[e].r = enemySize;
                }
            }
            paused = false;
        }
        if (findButtonClicked() === buttonClicked && buttonClicked !== -1){
            stop = false;
        }
        
        mouseClicked = false;
    }

    for (var u = 0; u < plyrUpgrds.options; u ++){
        var r = buttonRect(u);
        if (buttonClicked === u){
            fill(150,150,150);
        }
        else{
            fill(200,200,200);
        }
        rect(r.x,r.y,r.w,r.h,5);
        fill(0,0,0);
        textSize(20);
        text(choices[u].name+"\n\""+choices[u].desc+"\" ("+choices[u].rarity+")",
            r.x+5, r.y+5, r.w-10,r.h-10);
    }
rollChoices();
}
