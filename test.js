let handpose;
let video;
let hands = [];
let synth;
let tiredTimer = 0;
let timer = 0;
let interactionTimer = 10;
let interval = 25;

let gameStarted = false;

let tiredOff1 = 0;
let tiredOff2 = 0;

let tiredMood = 0;

// Skala 1-100
let angryMood = 40 + (Math.random() * 20);

let angryOff1 = 0.01;
let angryOff2 = 0.02;

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

// Distortion Value Min Max
let minValueDistortion = 0.01;
let maxValueDistortion = 0.3;
let distortionValue =
  minValueDistortion +
  ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);

const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

let gainNode; // Declared here but initialized later
let distortion; 

let soundInteraction = true;
let soundInterval = 30;
let soundTimer = 0;

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose.detectStart(video, getHandsData);

  field = generateField();
  generateAgents();

  // Skapa GainNode
  gainNode = new Tone.Gain(0.2).toDestination();  
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

    synth.set({
      envelope: {
        attack: attackValue,
        release: releaseValue,
      },
    });

    // Distortion
    if (angryMood > 69) {
      //distortionValue = minValueDistortion + ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);
      //distortion.distortion = distortionValue;
    } else {
      distortion.distortion = 0;
    }
    soundInteraction = false;
  }
}

function mouseClicked() {
  if(gameStarted){
    gameStarted = false;
  }else{
  gameStarted = true; 
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
      Math.random() * 640, // Video width
      Math.random() * 480, // Video height
      4,
      0.1
    );
    agents.push(agent);
  }
}

function mouseClicked() {
  if (gameStarted) {
    gameStarted = false;
  } else {
    gameStarted = true;
  }
}

function draw() {
  translate(video.width, 0); // Flytta koordinatsystemet till höger kanten av videon
  scale(-1, 1); // Invertera videon horisontellt
  image(video, 0, 0); // Rita videon

  if (gameStarted) {
    //Garrit flow field + Gpt to know where to put it

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
      const desiredDirection = field[x][y];
      agent.follow(desiredDirection);
      agent.update();
      agent.checkBorders();
      agent.draw();
    }

    // Kontrollera om det finns händer detekterade
    if (hands.length > 0) {
      // Loopa genom alla händer som detekterats
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
          angryMood = angryMood + (Math.random() * 2);
        }

        // Kontrollera om middle finger är uppsträckt för att sätta angryMood till 100
        if (middleFinger.y < thumb.y - 30 && middleFinger.y < indexFinger.y - 50 && middleFinger.y < ringFinger.y - 50 && middleFinger.y < pinky.y - 50 && interactionTimer > 10 && angryMood < 100) {
          angryMood = angryMood + (Math.random() * 8)
          if(angryMood > 100){
            angryMood = 100;
          }
          interactionTimer = 0;
        }
      }
    }

    if (timer > interval) {
      playNote();
      timer = 0;
    }

    if(tiredTimer > interval*10){
      if(Math.random() > 0.6){
      tiredMood++;
     }
      tiredTimer = 0;
    }

    if(soundTimer > soundInterval && soundInteraction === false){
      soundInteraction = true;
      soundTimer = 0;
    }

    soundValuesUpdate();
    console.log(angryMood);
    //console.log(tiredMood);

    timer++;
    tiredTimer++;
    interactionTimer++;

    soundTimer++;
    //console.log(attackValue);
  }
}

function getHandsData(results) {
  hands = results;
}

function playNote() {
  /*let note1 = Math.floor(Math.random() * 6);

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
  }*/

  let angryProbability = 0;

  // Only introduce angry notes when angryMood is 60 or above
  if (angryMood >= 60) {
    angryProbability = (angryMood - 60) / 60; // Scale from 0 (at 60 mood) to 1 (at 100 mood)
  }

  // Pick notes based on mood
  let note1, note2, note3;

  // If in a happy mood
  if (angryMood < 60) {
    let baseNoteIndex = Math.floor(Math.random() * 6); // Get a base note index for a chord

    // Assign notes with intervals of +2 (third) and +4 (fifth)
    note1 = happyNotes[baseNoteIndex];
    note2 = happyNotes[(baseNoteIndex + 2) % happyNotes.length]; // Wrap around the scale
    note3 = happyNotes[(baseNoteIndex + 4) % happyNotes.length]; // Wrap around the scale
  } else {
    // For angry mood, keep random selection based on probability
    note1 = pickNoteBasedOnMood(angryProbability);
    note2 = pickNoteBasedOnMood(angryProbability);
    note3 = pickNoteBasedOnMood(angryProbability);
  }

  // Get the current time from Tone.js
  let now = Tone.now();
  // Spela tre noter med små fördröjningar mellan
  synth.triggerAttackRelease(notes[note1], "8n", now); 
  synth.triggerAttackRelease(notes[note2], "8n", now + angryOff1 + tiredOff1); 
  synth.triggerAttackRelease(notes[note3], "8n", now + angryOff2 + tiredOff2); 
}
