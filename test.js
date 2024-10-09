let handpose;
let video;
let hands = [];
let synth;
let gainNode;
let distortion; 
let timer = 0;
let interactionTimer = 10;

let gameStarted = false;

// Starts tired mood between 40-60
let tiredMood = 40 + (Math.random() * 20);

// Starts Angry mood between 40-60
//let angryMood = 40 + (Math.random() * 20);
let angryMood = 1;

//Off Variables (Make sound off timing)
let angryOff1 = 0.01;
let angryOff2 = 0.02;
let tiredOff1 = 0;
let tiredOff2 = 0;

// Attack value (Start (without mood change)) 0.1 - 0.2
let attackBaseValue = 0.05 + Math.random() * 0.05;
let attackAngryRandomFactor = 0.08 + Math.random() * 0.04;
let attackValueAngryAdd; // Initialiseras senare
let attackValue; // Initialiseras senare

// Release base value (0.1-0.2) + mood changes (0-0.4 depending on mood and random factor)
let releaseBaseValue = 0.11 + Math.random() * 0.08;
let releaseAngryRandomFactor = 0.37 + Math.random() * 0.06;
let releaseValueAngryAdd; // Initialiseras senare
let releaseValue; // Initialiseras senare

// Distortion Value Min Max GÖRA OM DENNA
let minValueDistortion = 0.01;
let maxValueDistortion = 0.3;
let distortionValue =
  minValueDistortion +
  ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);


//Volume
let volumeBaseValue = 0.2;
let volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
let volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
let volumeValue = volumeBaseValue + volumeValueAngryAdd;

// Interval
let intervalBaseValue = 26;
let intervalRandomFactor = 9 + Math.random() * 2;
let intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
let intervalTiredMoodAdd = (tiredMood / 100) * intervalRandomFactor;
let interval = intervalBaseValue - intervalAngryMoodRemove;

// Notes arrays to use
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const angryNotes = ["C4", "C#4", "D#4", "F#4", "G#4", "A#4", "B4"]; // Dissonant/random notes

//Sound Interaction (Adjust how often sound updates)
let soundInteraction = true;
let soundInterval = 30;
let soundTimer = 0;

//Width and height for camera and canvas
widthSetup = (innerWidth / 4) * 3; // three fourths of screen
heightSetup = (widthSetup /3) *2; //two thirds of width Setup (3:2 ratio)

//Flow field
const fieldSize = 50;
const maxCols = Math.ceil(widthSetup / fieldSize); // Use the video width for the field size
const maxRows = Math.ceil(heightSetup / fieldSize); // Use the video height for the field size
const divider = 4;
let field = [];
let agents = [];
let middleFingerPos;

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(widthSetup, heightSetup);
  video = createCapture(VIDEO);
  video.size(widthSetup, heightSetup);
  video.hide();

  handpose.detectStart(video, getHandsData);

  field = generateField();
  generateAgents();

  // Skapa GainNode
  gainNode = new Tone.Gain(volumeValue).toDestination();  
  distortion = new Tone.Distortion(distortionValue).connect(gainNode); // Justerbar distortion, värdet kan ändras

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

  if (angryMood < 70) {
    distortion.distortion = 0;
  }

  // Update values for attack and release
  attackValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
  attackValue = releaseBaseValue + attackValueAngryAdd;

  releaseValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
  releaseValue = releaseBaseValue + releaseValueAngryAdd;
}

function soundValuesUpdate() {
  if (soundInteraction) {
    // Attack
    attackBaseValue = 0.05 + Math.random() * 0.05;
    attackAngryRandomFactor = 0.08 + Math.random() * 0.04;
    attackValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
    // Direct operator for Attack Value
    attackValue = attackBaseValue + attackValueAngryAdd;

    // Release
    releaseBaseValue = 0.11 + Math.random() * 0.08;
    releaseAngryRandomFactor = 0.37 + Math.random() * 0.06;
    releaseValueAngryAdd = (1 - angryMood / 100) * releaseAngryRandomFactor;
    // Direct operator for Release Value
    releaseValue = releaseBaseValue + releaseValueAngryAdd;

    // Volume
    volumeBaseValue = 0.2;
    volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
    volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
    // Direct operator for Volume Value
    volumeValue = volumeBaseValue + volumeValueAngryAdd;

    //Interval
    intervalBaseValue = 26;
    intervalRandomFactor = 9 + Math.random() * 2;
    intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
    intervalTiredMoodAdd = (tiredMood / 100) * intervalRandomFactor;
    interval = intervalBaseValue - intervalAngryMoodRemove + intervalTiredMoodAdd;

    //Distortion - HAPPY/ANGRY
    if (angryMood > 70) {
      // More or little less distortion
      if(Math.random() > 0.5){
        distortion.distortion = Math.random() * 0.2;
      } else{
        distortion.distortion = Math.random() * 0.1;
      }
    } else {
      distortion.distortion = 0;
    }

    //Update Synth
    synth.set({
      envelope: {
        attack: attackValue,
        release: releaseValue,
      },
    });

    //Interaction (Updates sounds) Variable false to restart counter for update
    soundInteraction = false;
  }
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
  for (let i = 0; i < 200; i++) {
    let agent = new Agent(
      Math.random() * widthSetup, // Video width
      Math.random() * heightSetup, // Video height
      4,
      0.1
    );
    agents.push(agent);
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
  translate(video.width, 0); // Flytta koordinatsystemet till höger kanten av videon
  scale(-1, 1); // Invertera videon horisontellt
  image(video, 0, 0); // Rita videon

  //Kolla om det ska starta eller ej
  if (gameStarted) {

     // Get the current middle finger position
     if (hands.length > 0) {
      let hand = hands[0];
      middleFingerPos = createVector(
        hand.middle_finger_tip.x,
        hand.middle_finger_tip.y
      );
    }

     // Update the flow field based on the middle finger position
     field = generateField(); // Regenerate the field on every frame

     // Agents follow the updated field
     for (let agent of agents) {
      const x = Math.floor(agent.position.x / fieldSize);
      const y = Math.floor(agent.position.y / fieldSize);
    
      // Kontrollera att x och y ligger inom fältets gränser
      if (x >= 0 && x < maxCols && y >= 0 && y < maxRows) {
        const desiredDirection = field[x][y];
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
 
  
    //Hand detector här inne görs poser
    if (hands.length > 0) {
      for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
        let indexFinger = hand.index_finger_tip;
        let thumb = hand.thumb_tip;
        let middleFinger = hand.middle_finger_tip;
        let ringFinger = hand.ring_finger_tip;
        let pinky = hand.pinky_finger_tip;

        fill(0, 255, 0);
        ellipse(indexFinger.x, indexFinger.y, 10);
        ellipse(thumb.x, thumb.y, 10);
        ellipse(middleFinger.x, middleFinger.y, 10);
        ellipse(ringFinger.x, ringFinger.y, 10);
        ellipse(pinky.x, pinky.y, 10);

        // Om pinky är i ett visst område, öka angryMood
        if(pinky.x > 400 && pinky.y < 100 && angryMood < 100 && timer > interval){
          angryMood = angryMood + (Math.random() * 0.5);
        }

        // Kontrollera om middle finger är uppsträckt för att sätta angryMood till 100
        if (middleFinger.y < thumb.y - 30 && middleFinger.y < indexFinger.y - 50 && middleFinger.y < ringFinger.y - 50 && middleFinger.y < pinky.y - 50 && interactionTimer > 10 && angryMood < 100) {
          angryMood = angryMood + (Math.random() * 8)
          interactionTimer = 0;
        }
      }
    }

    // Timers & Counters

    //Play sound timer
    if (timer > interval) {
      //Constantly makes the system more tired for the longer it plays
      if(tiredMood < 100){
      tiredMood = tiredMood + (Math.random() * 0.5);
    }

      //Play notes
      playNote();

      //reset timer
      timer = 0;
    }

    //Update sound values timer
    if(soundTimer > soundInterval && soundInteraction === false){
      soundInteraction = true;
      soundTimer = 0;
    }

    //Update values with function(s)
    soundValuesUpdate();

    //Increase values for timers
    timer++;
    interactionTimer++;
    soundTimer++;

    //Console Logs
    console.log("Angry Mood Value: " + angryMood);
    console.log("Tired Mood Value: " + tiredMood);
    console.log("Release Value: " + releaseValue);
    console.log("Attack Value: " + attackValue);
    console.log("Interval: " + interval);
    console.log("Volume Value: " + volumeValue);

    //Randoms changes to mood (Not controllable by user)
    angryMood = angryMood + ((Math.random()* 0.3) - 0.15);
    tiredMood = tiredMood + ((Math.random()* 0.3) - 0.15);

    //Makes sure the values doesnt go far above 100 (Can mess up some values)
    if(angryMood > 100){
      angryMood = 100;
    }
    if(tiredMood > 100){
      tiredMood = 100;
    }

  }
}

function getHandsData(results) {
  hands = results;
}

// Play the synth notes function
function playNote() {
  let note1 = Math.floor(Math.random() * 6);

  let note2 = note1 + 2;
  if (note2 == 7) {
    note2 = 0;
  } else if (note2 == 8) {
    note2 = 1;
  }

  let note3 = note2 + 2;
  if (note3 == 7) {
    note3 = 0;
  } else if (note3 == 8) {
    note3 = 1;
  }

  // Get the current time from Tone.js
  let now = Tone.now();
  // Spela tre noter med små fördröjningar mellan

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
      synth.triggerAttackRelease(angryNotes[note2], "8n", now + angryOff1 + tiredOff1); 
    } else{
      synth.triggerAttackRelease(notes[note2], "8n", now + angryOff1 + tiredOff1);
    }
    if(randomValue3 > 0.5){
      synth.triggerAttackRelease(angryNotes[note3], "8n", now + angryOff2 + tiredOff2); 
    } else{
      synth.triggerAttackRelease(notes[note3], "8n", now + angryOff2 + tiredOff2); 
    }
} else {
  synth.triggerAttackRelease(notes[note1], "8n", now); 
  synth.triggerAttackRelease(notes[note2], "8n", now + angryOff1 + tiredOff1); 
  synth.triggerAttackRelease(notes[note3], "8n", now + angryOff2 + tiredOff2); 
}
}

//Garrit flow field
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
    stroke(255, 0, 0, 100);
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
