//Variables
let handpose;
let video;
let synth;
let gainNode;
let distortion; 
let reverb;
let timer = 0;
let interactionTimer = 0;
let interactionInterval = 20;
let gameStarted = false;

//Arrays
let hands = [];

//Random color
let color1;
let color1X;
let color1Y;
let colorTimer = 0;
let colorInterval = 100;
let r1 = 0;
let g1 = 0;
let b1 = 0;

//Mic
let mic;
let micVolume;
let meter;

// Moods (random starting point)
let tiredMood = 20 + (Math.random() * 10);
let angryMood = 40 + (Math.random() * 20);

//Off Variables (Make sound off timing)
let tiredOffTiming1 = 0;
let tiredOffTiming2 = 0;

//"grid" areas interactions
let interactionAreaTimerX = 0;
let interactionAreaIntervalX = 30;
let interactionAreaTimerY = 0;
let interactionAreaIntervalY = 30;

// Attack values
let attackBaseValue = 0.05 + Math.random() * 0.05;
let attackAngryRandomFactor = 0.08 + Math.random() * 0.04;
let attackValueAngryAdd = (1 - angryMood / 100) * attackAngryRandomFactor;
let attackValue = attackBaseValue + attackValueAngryAdd;

// Release values
let releaseBaseValue = 0.11 + Math.random() * 0.08;
let releaseAngryRandomFactor = 0.37 + Math.random() * 0.06;
let releaseValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
let releaseValue = releaseBaseValue + releaseValueAngryAdd;

// Distortion (Start 0)
let distortionValue = 0;

//Volume start values
let volumeBaseValue = 0.2;
let volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
let volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
let volumeTiredRandomFactor = 0.2 + Math.random() * 0.1;
let volumeValueTiredRemove = (tiredMood/100) * volumeTiredRandomFactor;
let volumeValue = volumeBaseValue + volumeValueAngryAdd - volumeValueTiredRemove;

// Interval start values
let intervalBaseValue = 26;
let intervalRandomFactor = 9 + Math.random() * 2;
let intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
let intervalTiredMoodAdd = (tiredMood / 100) * intervalRandomFactor;
let interval = intervalBaseValue - intervalAngryMoodRemove;

//Notes
let note1 = 0
let note2 = 2;
let note3 = 4;
const happyNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5"];
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const angryNotes = ["C4", "C#4", "D#4", "F#4", "G#4", "A#4", "B4"]; // Dissonant/random notes

//Sound Interaction (Adjust how often sound updates)
let soundInterval = 30;
let soundTimer = 0;

//Width and height for camera and canvas
let widthSetup = (innerWidth / 4) * 3; // three fourths of screen
let heightSetup = (widthSetup /3) *2; //two thirds of width Setup (3:2 ratio)

//Flow field
const fieldSize = 50;
const maxCols = Math.ceil(widthSetup / fieldSize); // Use the video width for the field size
const maxRows = Math.ceil(heightSetup / fieldSize); // Use the video height for the field size
const divider = 4;
let field = [];
let agents = [];
let middleFingerPos;

//rectangles
let rectangles = [];
let rectangleTimer = 0;
let rectangleInterval = 150;

let flowFieldCounter = 0; // Counter for flow field generation
let speedAgentMood = 1 + ((1 - tiredMood / 100) * 8);

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(widthSetup, heightSetup);
  video = createCapture(VIDEO);
  video.size(widthSetup, heightSetup);
  video.hide();

  handpose.detectStart(video, getHandsData);

  mic = new Tone.UserMedia();
  meter = new Tone.Meter(); 
  mic.connect(meter); 
  mic.open();

  field = generateField();
  generateAgents();

  // Skapa GainNode
  gainNode = new Tone.Gain(volumeValue).toDestination();  
  distortion = new Tone.Distortion(distortionValue).connect(gainNode); // Justerbar distortion, värdet kan ändras
  reverb = new Tone.Reverb({decay: 3, preDelay: 0.01}).connect(gainNode);

  // Koppla synth till distortion
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: attackValue,
      decay: 0.2,
      sustain: 0.2,
      release: releaseValue,
    },
  }).connect(distortion); // Koppla synthens output till distorsion
  synth.connect(reverb);

//Get random color positions
color1X = video.width - (video.width * Math.random());
color1Y = video.height - (video.height * Math.random());
}

function soundValuesUpdate() {
    // Attack
    attackBaseValue = 0.05 + Math.random() * 0.05;
    attackAngryRandomFactor = 0.08 + Math.random() * 0.04;
    attackValueAngryAdd = (1 - angryMood / 100) * attackAngryRandomFactor;
    attackValue = attackBaseValue + attackValueAngryAdd; // Direct operator for Attack Value
    // Release
    releaseBaseValue = 0.11 + Math.random() * 0.08;
    releaseAngryRandomFactor = 0.37 + Math.random() * 0.06;
    releaseValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
    releaseValue = releaseBaseValue + releaseValueAngryAdd; // Direct operator for Release Value
    // Volume
    volumeBaseValue = 0.2;
    volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
    volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
    volumeTiredRandomFactor = 0.2 + Math.random() * 0.1;
    volumeValueTiredRemove = (tiredMood/100) * volumeTiredRandomFactor;
    volumeValue = volumeBaseValue + volumeValueAngryAdd - volumeValueTiredRemove; // Direct operator for Volume Value
    //Interval
    intervalBaseValue = 26;
    intervalRandomFactor = 9 + Math.random() * 2;
    intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
    intervalTiredMoodAdd = (tiredMood / 100) * intervalRandomFactor;
    interval = intervalBaseValue - intervalAngryMoodRemove + intervalTiredMoodAdd; //direct operator for interval length
    //Distortion
    if (angryMood > 70) {
      if(Math.random() > 0.5){
        distortion.distortion = Math.random() * 0.2;
      } else{
        distortion.distortion = Math.random() * 0.1;
      }
    } else {
      distortion.distortion = 0;
    }

    // reverb wetness based on tiredMood (0 to 1)
    reverb.wet.value = tiredMood / 100;
    // Optionally adjust reverb decay time for a more pronounced effect
    reverb.decay = 1 + (tiredMood / 100) * 3;
    
    //Off timing (only for tiredmood 70+)
    if(tiredMood > 70) {
    tiredOffTiming1 = (tiredMood/100) * (Math.random() * 0.3 - 0.15);
    tiredOffTiming2 = (tiredMood/100) * (Math.random() * 0.2 - 0.1);
  } else {
    tiredOffTiming1 = 0;
    tiredOffTiming2 = 0;
  }
    //Update Synth
    synth.set({
      envelope: {
        attack: attackValue,
        release: releaseValue,
      },
    });
}

//Garrit flow field code
function generateField() {
  let field = [];
  noiseSeed(Math.random() * 100);
  for (let x = 0; x < maxCols; x++) {
    field.push([]);
    for (let y = 0; y < maxRows; y++) {
      let pos = createVector(x * fieldSize, y * fieldSize);

      // If we have a detected middle finger position
      if (middleFingerPos) {
        // Create a vector pointing from the current position to the middle finger
        let attractor = p5.Vector.sub(middleFingerPos, pos).normalize();
        field[x].push(attractor); // Set the flow field vector to point towards the middle finger
      } else {
        // Default to random noise if no middle finger is detected
        let noiseValue = noise(x / divider, y / divider) * Math.PI * 2;
        field[x].push(p5.Vector.fromAngle(noiseValue));
      }
    }
  }
  return field;
}

function generateAgents() {
  for (let i = 0; i < widthSetup * 0.2; i++) {
    let agent = new Agent(
      Math.random() * widthSetup, // Video width
      Math.random() * heightSetup, // Video height
      speedAgentMood,
      0.2
    );
    agents.push(agent);
  }
}

function generateRectangle() {
    let x = Math.random() * widthSetup;
    let y = Math.random() * heightSetup;
    let w = widthSetup * 0.08;
    let h = widthSetup * 0.08;
    let color = Math.floor(Math.random() * 3) + 1; //Generates between 1-3
    if(y > (heightSetup - h)){
      y = y - h; //moves the rectangle to not be outside the canvas
    } if(x > (widthSetup - w)){
      x = x - w; //moves the rectangle to not be outside the canvas
    }
    let rectangle = {
      x: x,
      y: y,
      width: w,
      height: h,
      color: color,
      lifeTime: 250,
      counter: 0
    };
    rectangles.push(rectangle);
}
  
function drawRectangles() {
  for (rectangle of rectangles) {
    push();
    if(rectangle.color == 1){
      stroke(220, 220, 220); //white
    } else if (rectangle.color == 2){
      stroke(0, 0, 220); // Blue
    } else {
      stroke(220, 0, 0); // red
    }
    noFill();
    strokeWeight(3);
    rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    pop();
  }
}

function checkAgentInsideRect() {
  for (let r = 0; r < rectangles.length; r++) {
    let rectangle = rectangles[r];
    let agentsInsideRect = 0; //Variable for amounts of agents inside rect
          for (let agent of agents) {
            let agentInsideRectangleX = agent.position.x > rectangle.x && agent.position.x < rectangle.x + rectangle.width;
            let agentInsideRectangleY = agent.position.y > rectangle.y && agent.position.y < rectangle.y + rectangle.height;
            if (agentInsideRectangleX && agentInsideRectangleY) {
              agentsInsideRect++;
            }
          }
          if (agentsInsideRect > widthSetup * 0.01) { //Using widthsetup to be "responsive" for small/big screens
            if(rectangle.color === 1){
              if(tiredMood > 10){
                tiredMood = tiredMood - 10; //makes it less tired
              }
            } else if (rectangle.color === 2){
              if(angryMood > 5){
                 angryMood = angryMood - 5; //Makes it less angry
              }
            } else {
              if(angryMood < 100){
                angryMood = angryMood + 10; //Makes it more angry
             }
            }
            rectangles.splice(r, 1);  
            break;
          }else if(rectangle.counter > rectangle.lifeTime){ 
            rectangles.splice(r, 1);  
            break;
          }
          rectangle.counter++;
   }
 }

function randomColor(){
  if(colorTimer > colorInterval){
  color1X = video.width - (video.width * Math.random());
  color1Y = video.height - (video.height * Math.random());
  color1 = video.get(color1X, color1Y);
  r1 = color1[0];
  g1 = color1[1];
  b1 = color1[2];
  if(r1 > g1 + 60 && r1 > b1 + 60 && angryMood < 100){ //dominant red value -> random increase
    angryMood = angryMood + Math.random()*0.1
  }
  if(b1 > g1 + 60 && b1 > r1 + 60 && angryMood > 1){ //dominant blue value -> random decrease
    angryMood = angryMood - Math.random()*0.1
  }
  if(g1 > r1 + 60 && g1 > b1 + 60){  //dominant green value -> random increase/decrease
    angryMood = (angryMood * Math.random()*0.3) - 0.15;
  }
    colorTimer = 0;
  }
  push();
  noStroke();
  fill(r1, g1, b1);
  rect(10, 10, 50, 50); //Draws a rectangle of the color picked to somewhat give a small hint about it
  pop();
}

function checkForHandPose(){
      //Hand detector här inne görs poser
      if (hands.length > 0) {
        for (let i = 0; i < hands.length; i++) {
          let hand = hands[i];
          let indexFingerTop = hand.index_finger_tip;
          let thumbTop = hand.thumb_tip;
          let middleFingerTop = hand.middle_finger_tip;
          let ringFingerTop = hand.ring_finger_tip;
          let pinkyTop = hand.pinky_finger_tip;
          let indexFingerMid = hand.index_finger_pip;
          let thumbMid = hand.thumb_ip; //I think this is a bug, pip doesnt work but ip does!!
          let middleFingerMid = hand.middle_finger_pip;
          let indexFingerBottom = hand.index_finger_mcp;
          let middleFingerBottom = hand.middle_finger_mcp;
          let pinkyBottom = hand.pinky_finger_mcp;
  
          fill(0, 255, 0);
          ellipse(indexFingerTop.x, indexFingerTop.y, 10);
          ellipse(indexFingerBottom.x, indexFingerBottom.y, 10);
          ellipse(thumbTop.x, thumbTop.y, 10);
          ellipse(middleFingerTop.x, middleFingerTop.y, 10);
          ellipse(ringFingerTop.x, ringFingerTop.y, 10);
          ellipse(pinkyTop.x, pinkyTop.y, 10);
  
          //Pose "middle finger" to make it more angry fast
          let middleFingerPoseTops = middleFingerTop.y < thumbTop.y && middleFingerTop.y < indexFingerTop.y && middleFingerTop.y < ringFingerTop.y && middleFingerTop.y < pinkyTop.y;
          let middleFingerPoseMid = middleFingerMid.y < indexFingerTop.y - 10 && middleFingerMid.y < ringFingerTop.y && middleFingerMid.y < pinkyTop.y;
          let middleFingerPose = middleFingerTop.y < middleFingerMid.y;
          if (middleFingerPoseTops && middleFingerPoseMid && middleFingerPose && interactionTimer > interactionInterval && angryMood < 100) {
            angryMood = angryMood + (Math.random() * 6)
            interactionTimer = 0;
            console.log("Angry mood increased because of middlefinger-pose!");
          }
  
          //pose "peace" to make it happier
          let peacePoseIndexTop = indexFingerTop.y < thumbTop.y && indexFingerTop.y < ringFingerTop.y && indexFingerTop.y < pinkyTop.y;
          let peacePoseMiddleTop = middleFingerTop.y < thumbTop.y && middleFingerTop.y < ringFingerTop.y && middleFingerTop.y < pinkyTop.y;
          let peacePoseIndexMid = indexFingerMid.y < thumbTop.y && indexFingerMid.y < ringFingerTop.y && indexFingerMid.y < pinkyTop.y;
          let peacePoseMiddleMid = middleFingerMid.y < thumbTop.y && middleFingerMid.y < ringFingerTop.y && middleFingerMid.y < pinkyTop.y;
          if (peacePoseIndexTop && peacePoseMiddleTop && peacePoseIndexMid && peacePoseMiddleMid && interactionTimer > interactionInterval && angryMood > 4) {
            angryMood = angryMood - Math.random() * 4;
            interactionTimer = 0;
            console.log("Angry mood decreased because of peace-pose!");
          }
  
          //Thumbs up & down pose
          let indexFingerDifference = indexFingerTop.x - indexFingerBottom.x;
          let middleFingerDifference = middleFingerTop.x - middleFingerBottom.x;
          let pinkyBottomFingerDifference = pinkyTop.x - pinkyBottom.x;
          let indexFingerIn = indexFingerDifference < 40 && indexFingerDifference > 0 || indexFingerDifference < 0 && indexFingerDifference > -40;
          let middleFingerIn = middleFingerDifference < 40 && middleFingerDifference > 0 || middleFingerDifference < 0 && middleFingerDifference > -40;
          let pinkyIn = pinkyBottomFingerDifference < 40 && pinkyBottomFingerDifference > 0 || pinkyBottomFingerDifference < 0 && pinkyBottomFingerDifference > -40;
          let thumbUpPoseY = thumbMid.y < indexFingerTop.y && thumbMid.y < middleFingerTop.y && thumbMid.y < ringFingerTop.y && thumbMid.y < pinkyTop.y;
          let thumbIsUp = thumbTop.y < thumbMid.y;
          let thumbDownPoseY = thumbMid.y > indexFingerTop.y && thumbMid.y > middleFingerTop.y && thumbMid.y > ringFingerTop.y && thumbMid.y > pinkyTop.y;
          let thumbIsDown = thumbTop.y > thumbMid.y;
          //thumbs up
          if(thumbUpPoseY && thumbIsUp && indexFingerIn && middleFingerIn && pinkyIn && interactionTimer > interactionInterval && tiredMood > 2){
            tiredMood = tiredMood - Math.random() * 3;
            interactionTimer = 0;
            console.log("Tired mood decreased because of thumbs up!");
          }
          //thumbsdown
          if(thumbDownPoseY && thumbIsDown && indexFingerIn && middleFingerIn && pinkyIn && interactionTimer > interactionInterval && tiredMood < 100){
            tiredMood = tiredMood + Math.random() * 1.5;
            interactionTimer = 0;
            console.log("Tired mood increased because of thumbs down!");
          }
        }
      }
}

function checkForHandPosition(){
  let widthArea1 = 0;
  let widthArea2 = (widthSetup/4);
  let widthArea3 = (widthSetup/4) * 2;
  let widthArea4 = (widthSetup/4) * 3;
  let heightArea1 = 0;
  let heightArea2 = (heightSetup/2);

  //Hand detector här inne görs poser
  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let middleFingerBottom = hand.middle_finger_mcp;

      let withinWidthArea1 = middleFingerBottom.x > widthArea1 && middleFingerBottom.x < widthArea1 + (widthSetup/4);
      let withinWidthArea2 = middleFingerBottom.x > widthArea2 && middleFingerBottom.x < widthArea2 + (widthSetup/4);
      let withinWidthArea3 = middleFingerBottom.x > widthArea3 && middleFingerBottom.x < widthArea3 + (widthSetup/4);
      let withinWidthArea4 = middleFingerBottom.x > widthArea4 && middleFingerBottom.x < widthArea4 + (widthSetup/4);
      let withinHeightArea1 = middleFingerBottom.y > heightArea1 && middleFingerBottom.y < heightArea1 + (heightSetup/2);
      let withinHeightArea2 = middleFingerBottom.y > heightArea2 && middleFingerBottom.y < heightArea2 + (heightSetup/2);

      if(withinWidthArea1 && interactionAreaTimerX > interactionAreaIntervalX){
        angryMood = angryMood + (Math.random() * 0.2);
        interactionAreaTimerX = 0;
      }if(withinWidthArea2 && interactionAreaTimerX > interactionAreaIntervalX){
        tiredMood = tiredMood + (Math.random() * 0.2);
        interactionAreaTimerX = 0;
      }if(withinWidthArea3 && interactionAreaTimerX > interactionAreaIntervalX){
        angryMood = angryMood - (Math.random() * 0.2);
        interactionAreaTimerX = 0;
      }if(withinWidthArea4 && interactionAreaTimerX > interactionAreaIntervalX){
        tiredMood = tiredMood - (Math.random() * 0.2);
        interactionAreaTimerX = 0;
      }if(withinHeightArea1 && interactionAreaTimerY > interactionAreaIntervalY){
        angryMood = angryMood + Math.random() - 0.5;
        interactionAreaTimerY = 0;
      }if(withinHeightArea2 && interactionAreaTimerY > interactionAreaIntervalY){
        tiredMood = tiredMood + Math.random() - 0.5;
        interactionAreaTimerY = 0;
      }
  }
}
}

function micVolumeLevel() {
  micVolume = meter.getValue();
  if(micVolume > -15 && interactionTimer > 10){
    let randomCheck = Math.random();
    if(randomCheck >= 0.6 && angryMood < 100){
      angryMood = angryMood + (0.5*Math.random());
      console.log("Angrymood increase because of sound!")
    } else if (randomCheck < 0.6 && tiredMood > 1) {
      tiredMood = tiredMood - (0.5*Math.random());
      console.log("Tiredmood decreased because of sound!")
    }
    interactionTimer = 0;
  }
}

function noteOrderLogic(){
  //Choice of note1, either random or logic depending on mood
  if(angryMood < 26){
    if(note1 === 0){
      note1 = 3;
    } else if(note1 === 3){
      note1 = 4;
    } else if (note1 === 4){
      note1 = 7;
    } else if (note1 === 7){
      note1 = 10;
    } else if (note1 === 10){
      note1 = 0;
    } else{
      note1 = 0;
    }
  } else{
  note1 = Math.floor(Math.random() * 6);
  }

  //Choice of note2 or 3 logic, also changing based on mood
  if(angryMood < 26){
    note2 = note1 + 2;
   if (note2 == 14) {
    note2 = 0;
    } else if (note2 == 15) {
    note2 = 1;
     }
  note3 = note2 + 2;
  if (note3 == 14) {
    note3 = 0;
  } else if (note3 == 15) {
    note3 = 1;
  }
  } else{
  note2 = note1 + 2;
  if (note2 == 7) {
    note2 = 0;
  } else if (note2 == 8) {
    note2 = 1;
  }
  note3 = note2 + 2;
  if (note3 == 7) {
    note3 = 0;
  } else if (note3 == 8) {
    note3 = 1;
  }
}

}

function playNote() {
  noteOrderLogic();

  let now = Tone.now();

  if(angryMood > 75 && Math.random() > 0.5){
    let randomValue1 = Math.random();
    let randomValue2 = Math.random();
    let randomValue3 = Math.random();
  
    if(randomValue1 > 0.5){
      synth.triggerAttackRelease(angryNotes[note1], "8n", now); 
    } else{
      synth.triggerAttackRelease(notes[note1], "8n", now); 
    }
    if(randomValue2 > 0.5){
      synth.triggerAttackRelease(angryNotes[note2], "8n", now  + tiredOffTiming1); 
    } else{
      synth.triggerAttackRelease(notes[note2], "8n", now  + tiredOffTiming1);
    }
    if(randomValue3 > 0.5){
      synth.triggerAttackRelease(angryNotes[note3], "8n", now + tiredOffTiming2); 
    } else{
      synth.triggerAttackRelease(notes[note3], "8n", now + tiredOffTiming2); 
    }
} else if(angryMood < 26){
  synth.triggerAttackRelease(happyNotes[note1], "8n", now); 
  synth.triggerAttackRelease(happyNotes[note2], "8n", now + tiredOffTiming1); 
  synth.triggerAttackRelease(happyNotes[note3], "8n", now + tiredOffTiming2); 
}
else {
  synth.triggerAttackRelease(notes[note1], "8n", now); 
  synth.triggerAttackRelease(notes[note2], "8n", now + tiredOffTiming1); 
  synth.triggerAttackRelease(notes[note3], "8n", now + tiredOffTiming2); 
}
}

function mouseClicked() {
  if(gameStarted){
    gameStarted = false;
  }else{
  gameStarted = true; 
  }
}

function draw() {
  if (gameStarted) {
  //Video drawing & inverting (copy from lecture, with image)
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0);
    
  //FLOW FIELD
    let offsetX = ((angryMood / 100) * Math.random() * 200) - 100;
    let offsetY = ((angryMood / 100) * Math.random() * 200) - 100;
    if (hands.length > 0) {
      let hand = hands[0];
      middleFingerPos = createVector(
        hand.middle_finger_tip.x + offsetX,
        hand.middle_finger_tip.y + offsetY
      );
    }
    flowFieldCounter++;
    shakeIntensity = (angryMood / 100) * 10; // Shake depending on angrmood
    if (flowFieldCounter >= 6) {
      field = generateField();
      flowFieldCounter = 0;
    }
     // Agents follow the updated field
     for (let agent of agents) {
      const x = Math.floor(agent.position.x / fieldSize);
      const y = Math.floor(agent.position.y / fieldSize);
    
      // Kontrollera att x och y ligger inom fältets gränser
      if (x >= 0 && x < maxCols && y >= 0 && y < maxRows) {
        const desiredDirection = field[x][y];
        // Add randomness to the desired direction
        let randomAngle = (Math.random() - 0.55) * 0.55; // Random angle
        desiredDirection.rotate(randomAngle); // Rotate the direction vector
        agent.follow(desiredDirection);
      } else {
        // Hantera fall där agenten är utanför fältet (t.ex. ge en standard riktning)
        const defaultDirection = createVector(0, 0); // Exempelvis rakt nedåt
        agent.follow(defaultDirection);
      }
    
      agent.update();
      agent.checkBorders();
      agent.draw();
    }

    //Check for handposes / positions in the camera, mic noise level and colors to increase/decrease moods.
    checkForHandPose();
    checkForHandPosition();
    micVolumeLevel();
    randomColor();

    if(rectangleTimer > rectangleInterval){
        generateRectangle(); //create rectangle
        rectangleTimer = 0;
    }
    drawRectangles(); //draw the rectangles
    checkAgentInsideRect(); //Checks for agents inside to splice or splice it because of lifetime

    if(soundTimer > soundInterval){
      soundValuesUpdate(); //Updates the sound values (Such as, synth settings etc.)
      soundTimer = 0;
    } 
    if(timer > interval) {
      if(tiredMood < 100){
        tiredMood = tiredMood + (Math.random() * 0.3); //Constantly makes the system more tired for the longer it plays
      }
      playNote();
      timer = 0;
    }

    //Increase values for timers
    timer++, interactionTimer++, soundTimer++, colorTimer++, rectangleTimer++, interactionAreaTimerX++, interactionAreaTimerY++;

    //Makes sure the values doesnt go far above 100 or below 1 (Can mess up some values)
    if(angryMood > 100){
      angryMood = 100;
    } if(tiredMood > 100){
      tiredMood = 100;
    }if(angryMood < 1){
      angryMood = 1;
    } if(tiredMood < 1){
      tiredMood = 1;
    }
    angryMood = angryMood + ((Math.random()* 0.3) - 0.15); //Make the moods change constantly without input a little
    tiredMood = tiredMood + ((Math.random()* 0.3) - 0.15); //Make the moods change constantly without input a little
  } else { //START SCREEN!
    push();
    fill(210, 210, 210);
    rect(0, 0, widthSetup, heightSetup);
    pop();
  }
}

//copy from lecture 
function getHandsData(results) {
  hands = results;
}

//Agent class
class Agent {
  constructor(x, y, maxSpeed, maxForce) {
    this.position = createVector(x, y);
    this.lastPosition = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  follow(desiredDirection) {
    desiredDirection = desiredDirection.copy();
    desiredDirection.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desiredDirection, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.lastPosition = this.position.copy();
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    let shakeX = (Math.random() - 0.5) * shakeIntensity; // Add random shake to the position based on the shakeIntensity (some gpt)
    let shakeY = (Math.random() - 0.5) * shakeIntensity;
    this.position.add(this.velocity);
    this.position.x += shakeX;
    this.position.y += shakeY;
    this.maxSpeed = 1 + ((1 - tiredMood / 100) * 8);
  }


  checkBorders() {
    if (this.position.x < 0) {
      this.position.x = widthSetup;
      this.lastPosition.x = widthSetup;
    } else if (this.position.x > widthSetup) {
      this.position.x = 0;
      this.lastPosition.x = 0;
    }
    if (this.position.y < 0) {
      this.position.y = heightSetup;
      this.lastPosition.y = heightSetup;
    } else if (this.position.y > heightSetup) {
      this.position.y = 0;
      this.lastPosition.y = 0;
    }
  }

  draw() {
    if (hands.length > 0) {
      let hand = hands[0];
      middleFingerPos = createVector(
        hand.middle_finger_tip.x,
        hand.middle_finger_tip.y
      );
    }
    push();
    let moodColor = lerpColor(
      color(0, 0, 255),
      color(255, 0, 0),
      angryMood / 100
    );
    stroke(moodColor);
    strokeWeight(2);
    line(
      this.lastPosition.x,
      this.lastPosition.y,
      this.position.x,
      this.position.y
    );
    pop();
  }
}

/*
REFERENCES




*/