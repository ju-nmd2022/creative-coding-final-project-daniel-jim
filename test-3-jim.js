//Variables
let handpose;
let video;
let hands = [];
let synth;
let gainNode;
<<<<<<< HEAD
let distortion; 
=======
let distortion;
let reverb;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
let timer = 0;
let interactionTimer = 10;

//Get colorpicker positions
let color1;
let color2;
let color1X;
let color1Y;
let color2X;
let color2Y;

//Mic
let mic;
let micVolume;
let meter;

let gameStarted = false;

<<<<<<< HEAD
let note1 = 0
=======
let note1 = 0;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
let note2 = 2;
let note3 = 4;

// Moods (random starting point)
<<<<<<< HEAD
let tiredMood = 20 + (Math.random() * 10);
let angryMood = 40 + (Math.random() * 20);
=======
let tiredMood = 20 + Math.random() * 10;
let angryMood = 40 + Math.random() * 20;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

//Off Variables (Make sound off timing)
let tiredOffTiming1 = 0;
let tiredOffTiming2 = 0;

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
<<<<<<< HEAD

=======
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

// Distortion Value Min Max GÖRA OM DENNA
let minValueDistortion = 0.01;
let maxValueDistortion = 0.3;
let distortionValue =
  minValueDistortion +
  ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);

<<<<<<< HEAD

=======
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
//Volume values
let volumeBaseValue = 0.2;
let volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
let volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
let volumeValue = volumeBaseValue + volumeValueAngryAdd;

// Interval values
let intervalBaseValue = 26;
let intervalRandomFactor = 9 + Math.random() * 2;
let intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
let intervalTiredMoodAdd = (tiredMood / 100) * intervalRandomFactor;
let interval = intervalBaseValue - intervalAngryMoodRemove;

// Notes arrays to use
<<<<<<< HEAD
const happyNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5"];
=======
const happyNotes = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
];
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
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

let flowFieldCounter = 0; // Counter for flow field generation

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
<<<<<<< HEAD
  meter = new Tone.Meter(); 
  mic.connect(meter); 
=======
  meter = new Tone.Meter();
  mic.connect(meter);
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

  field = generateField();
  generateAgents();

  // Skapa GainNode
  gainNode = new Tone.Gain(volumeValue).toDestination();  
  distortion = new Tone.Distortion(distortionValue).connect(gainNode); // Justerbar distortion, värdet kan ändras
  reverb = new Tone.Reverb({
    decay: 3, // Base decay time
    preDelay: 0.01, // Small pre-delay
  }).connect(gainNode);

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

  if (angryMood < 70) {
    distortion.distortion = 0;
  }

  let colorRandom1 = Math.random();
<<<<<<< HEAD
let colorRandom2 = Math.random();

//Get colorpicker positions
color1X = video.width - (video.width * colorRandom1);
color1Y = video.height - (video.height * colorRandom1);

color2X = video.width - (video.width * colorRandom2);
color2Y = video.height - (video.height * colorRandom2);

=======
  let colorRandom2 = Math.random();

  //Get colorpicker positions
  color1X = video.width - video.width * colorRandom1;
  color1Y = video.height - video.height * colorRandom1;

  color2X = video.width - video.width * colorRandom2;
  color2Y = video.height - video.height * colorRandom2;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
}

function soundValuesUpdate() {
  if (soundInteraction) {
    // Attack
    attackBaseValue = 0.05 + Math.random() * 0.05;
    attackAngryRandomFactor = 0.08 + Math.random() * 0.04;
    attackValueAngryAdd = (1 - angryMood / 100) * attackAngryRandomFactor;
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
    //direct operator for interval length
<<<<<<< HEAD
    interval = intervalBaseValue - intervalAngryMoodRemove + intervalTiredMoodAdd;
=======
    interval =
      intervalBaseValue - intervalAngryMoodRemove + intervalTiredMoodAdd;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

    //Distortion
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

<<<<<<< HEAD
    //Off timing (only for tiredmood 70+)
    if(tiredMood > 70) {
    tiredOffTiming1 = (tiredMood/100) * (Math.random() * 0.3 - 0.15);
    tiredOffTiming2 = (tiredMood/100) * (Math.random() * 0.2 - 0.1);
  } else {
    tiredOffTiming1 = 0;
    tiredOffTiming2 = 0;
  }
=======
    // reverb wetness based on tiredMood (0 to 1)
    reverb.wet.value = tiredMood / 100;
    // Optionally adjust reverb decay time for a more pronounced effect
    reverb.decay = 1 + (tiredMood / 100) * 3;

    //Off timing (only for tiredmood 70+)
    if (tiredMood > 70) {
      tiredOffTiming1 = (tiredMood / 100) * (Math.random() * 0.3 - 0.15);
      tiredOffTiming2 = (tiredMood / 100) * (Math.random() * 0.2 - 0.1);
    } else {
      tiredOffTiming1 = 0;
      tiredOffTiming2 = 0;
    }
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

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
  for (let i = 0; i < widthSetup * 0.2; i++) {
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
  mic.open();
}

function draw() {
  translate(video.width, 0); // Flytta koordinatsystemet till höger kanten av videon
  scale(-1, 1); // Invertera videon horisontellt
  image(video, 0, 0); // Rita videon

  //Kolla om det ska starta eller ej
  if (gameStarted) {
<<<<<<< HEAD
    
  // Hämta färgvärdet (RGBA) vid mitten av videon
  color1 = video.get(color1X, color1Y);
  color2 = video.get(color2X, color2Y);

  // Extrahera RGB-värden
  let r1 = color1[0];
  let g1 = color1[1];
  let b1 = color1[2];

  let r2 = color2[0];
  let g2 = color2[1];
  let b2 = color2[2];

  push();
  noStroke();
  fill(r1, g1, b1);
  rect(10, 10, 50, 50); // Rita en liten ruta med färgen från mitten av videon
  fill(r2, g2, b2);
  rect(video.width - 60, 10, 50, 50); // Rita en liten ruta med färgen från mitten av videon
  pop();
=======
    // Hämta färgvärdet (RGBA) vid mitten av videon
    color1 = video.get(color1X, color1Y);
    color2 = video.get(color2X, color2Y);

    // Extrahera RGB-värden
    let r1 = color1[0];
    let g1 = color1[1];
    let b1 = color1[2];

    let r2 = color2[0];
    let g2 = color2[1];
    let b2 = color2[2];

    push();
    noStroke();
    fill(r1, g1, b1);
    rect(10, 10, 50, 50); // Rita en liten ruta med färgen från mitten av videon
    fill(r2, g2, b2);
    rect(video.width - 60, 10, 50, 50); // Rita en liten ruta med färgen från mitten av videon
    pop();
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2

    ///FIXAAAAAAAAAA DENNA
    //FIXA FIXA FIXA
    //FIXA RANDOM!
    let offsetX = 80;
    let offsetY = -100;
    // Get the current middle finger position
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
      field = generateField(); // Regenerate the field
      flowFieldCounter = 0; // Reset the counter
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
<<<<<<< HEAD
    
=======

>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
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

<<<<<<< HEAD
        let middleFingerPose = middleFinger.y < thumb.y - 30 && middleFinger.y < indexFinger.y - 50 && middleFinger.y < ringFinger.y - 50 && middleFinger.y < pinky.y - 50;
        //Pose "middle finger" to make it more angry fast
        if (middleFingerPose && interactionTimer > 10 && angryMood < 100) {
          angryMood = angryMood + (Math.random() * 8)
=======
        let middleFingerPose =
          middleFinger.y < thumb.y - 30 &&
          middleFinger.y < indexFinger.y - 50 &&
          middleFinger.y < ringFinger.y - 50 &&
          middleFinger.y < pinky.y - 50;
        //Pose "middle finger" to make it more angry fast
        if (middleFingerPose && interactionTimer > 10 && angryMood < 100) {
          angryMood = angryMood + Math.random() * 8;
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
          interactionTimer = 0;
          console.log("Angry mood increased because of middlefinger-pose!");
        }

        //pose "peace" to make it happier
<<<<<<< HEAD
        let peacePoseIndex = indexFinger.y < thumb.y - 30 && indexFinger.y < ringFinger.y - 50 && indexFinger.y < pinky.y - 50;
        let peacePoseMiddle = middleFinger.y < thumb.y - 30 && middleFinger.y < ringFinger.y - 50 && middleFinger.y < pinky.y - 50;
        if (peacePoseIndex && peacePoseMiddle && interactionTimer > 10 && angryMood > 4) {
=======
        let peacePoseIndex =
          indexFinger.y < thumb.y - 30 &&
          indexFinger.y < ringFinger.y - 50 &&
          indexFinger.y < pinky.y - 50;
        let peacePoseMiddle =
          middleFinger.y < thumb.y - 30 &&
          middleFinger.y < ringFinger.y - 50 &&
          middleFinger.y < pinky.y - 50;
        if (
          peacePoseIndex &&
          peacePoseMiddle &&
          interactionTimer > 10 &&
          angryMood > 4
        ) {
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
          angryMood -= Math.random() * 4;
          interactionTimer = 0;
          console.log("Angry mood decreased because of peace-pose!");
        }
      }
    }

    //Mic mood changes (Had to be here, since the "high noice" might be missed if only checked in intervals.)
<<<<<<< HEAD
    if(micVolume > -15 && interactionTimer > 10){
      let randomCheck = Math.random();
      if(randomCheck >= 0.6 && angryMood < 100){
        angryMood = angryMood + (0.5*Math.random());
        console.log("Angrymood increase because of sound!")
      } else if (randomCheck < 0.6 && tiredMood > 1) {
        tiredMood = tiredMood - (0.5*Math.random());
        console.log("Tiredmood decreased because of sound!")
=======
    if (micVolume > -15 && interactionTimer > 10) {
      let randomCheck = Math.random();
      if (randomCheck >= 0.6 && angryMood < 100) {
        angryMood = angryMood + 0.5 * Math.random();
        console.log("Angrymood increase because of sound!");
      } else if (randomCheck < 0.6 && tiredMood > 1) {
        tiredMood = tiredMood - 0.5 * Math.random();
        console.log("Tiredmood decreased because of sound!");
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
      }
      interactionTimer = 0;
    }

    // Timers & Counters

    //Play sound timer
    if (timer > interval) {
      //Constantly makes the system more tired for the longer it plays
<<<<<<< HEAD
      if(tiredMood < 100){
      tiredMood = tiredMood + (Math.random() * 0.5);
    }
=======
      if (tiredMood < 100) {
        tiredMood = tiredMood + Math.random() * 0.5;
      }
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
      //Play notes
      playNote();
      //reset timer
      timer = 0;
    }

    //Update sound values based on the current mood, and not constantly
<<<<<<< HEAD
    if(soundTimer > soundInterval && soundInteraction === false){
=======
    if (soundTimer > soundInterval && soundInteraction === false) {
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
      soundInteraction = true;
      soundTimer = 0;
    }

    //Update values with function(s)
    soundValuesUpdate();

    //Increase values for timers
    timer++;
    interactionTimer++;
    soundTimer++;

    //Mic volume level
    micVolume = meter.getValue();

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

    //Makes sure the values doesnt go far below 1 (Can mess up some values)
<<<<<<< HEAD
    if(angryMood < 1){
      angryMood = 1;
    }
    if(tiredMood < 1){
      tiredMood = 1;
    }

=======
    if (angryMood < 1) {
      angryMood = 1;
    }
    if (tiredMood < 1) {
      tiredMood = 1;
    }
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
  }
}

function getHandsData(results) {
  hands = results;
}

// Play the synth notes function
function playNote() {
<<<<<<< HEAD

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
=======
  //Choice of note1, either random or logic depending on mood
  if (angryMood < 26) {
    if (note1 === 0) {
      note1 = 3;
    } else if (note1 === 3) {
      note1 = 4;
    } else if (note1 === 4) {
      note1 = 7;
    } else if (note1 === 7) {
      note1 = 10;
    } else if (note1 === 10) {
      note1 = 0;
    } else {
      note1 = 0;
    }
  } else {
    note1 = Math.floor(Math.random() * 6);
  }

  //Choice of note2 or 3 logic, also changing based on mood
  if (angryMood < 26) {
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
  } else {
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
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
  }
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
<<<<<<< HEAD
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
=======
    if (randomValue2 > 0.5) {
      synth.triggerAttackRelease(
        angryNotes[note2],
        "8n",
        now + tiredOffTiming1
      );
    } else {
      synth.triggerAttackRelease(notes[note2], "8n", now + tiredOffTiming1);
    }
    if (randomValue3 > 0.5) {
      synth.triggerAttackRelease(
        angryNotes[note3],
        "8n",
        now + tiredOffTiming2
      );
    } else {
      synth.triggerAttackRelease(notes[note3], "8n", now + tiredOffTiming2);
    }
  } else if (angryMood < 26) {
    synth.triggerAttackRelease(happyNotes[note1], "8n", now);
    synth.triggerAttackRelease(happyNotes[note2], "8n", now + tiredOffTiming1);
    synth.triggerAttackRelease(happyNotes[note3], "8n", now + tiredOffTiming2);
  } else {
    synth.triggerAttackRelease(notes[note1], "8n", now);
    synth.triggerAttackRelease(notes[note2], "8n", now + tiredOffTiming1);
    synth.triggerAttackRelease(notes[note3], "8n", now + tiredOffTiming2);
  }
>>>>>>> 8c3c12a98361b280e926184f6e0fbbae9db25fe2
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
    // Add random shake to the position based on the shakeIntensity (some gpt)
    let shakeX = (Math.random() - 0.5) * shakeIntensity; // Shake in X direction
    let shakeY = (Math.random() - 0.5) * shakeIntensity; // Shake in Y direction
    this.position.add(this.velocity);
    this.position.x += shakeX; // Apply the shake to X
    this.position.y += shakeY; // Apply the shake to Y
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
