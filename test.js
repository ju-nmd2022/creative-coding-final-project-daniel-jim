let handpose;
let video;
let hands = [];
let synth;
let timer = 0;
let interactionTimer = 10;

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




//ENDAST FIXAD HÄR UPPE, INTE I UPDATE
let volumeBaseValue = 0.2;
let volumeAngryRandomFactor = 0.15 + Math.random() * 0.1;
let volumeValueAngryAdd = (angryMood/100) * volumeAngryRandomFactor;
let volumeValue = volumeBaseValue + volumeValueAngryAdd;


// Interval
let intervalBaseValue = 25;
let intervalRandomFactor = 0.1 + Math.random()*0.05;
let intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
let interval = intervalBaseValue - intervalAngryMoodRemove;




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
    intervalBaseValue = 30;
    intervalRandomFactor = 10 + Math.random() * 2;
    intervalAngryMoodRemove = (angryMood / 100) * intervalRandomFactor;
    //Interval direct operator
    interval = intervalBaseValue - intervalAngryMoodRemove;


    

    //Uptade Synth
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

function draw() {
  translate(video.width, 0); // Flytta koordinatsystemet till höger kanten av videon
  scale(-1, 1); // Invertera videon horisontellt
  image(video, 0, 0); // Rita videon

  if (gameStarted) {
  
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


    if(soundTimer > soundInterval && soundInteraction === false){
      soundInteraction = true;
      soundTimer = 0;
    }

    soundValuesUpdate();
    console.log("Angry Mood Value: " + angryMood);
    //console.log(tiredMood);

    timer++;
    interactionTimer++;

    soundTimer++;
    console.log("Release Value: " + releaseValue);
    console.log("Attack Value: " + attackValue);
    console.log("Interval: " + interval);
    console.log("Volume Value: " + volumeValue);


    
  }
}

function getHandsData(results) {
  hands = results;
}

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
  synth.triggerAttackRelease(notes[note1], "8n", now); 
  synth.triggerAttackRelease(notes[note2], "8n", now + angryOff1 + tiredOff1); 
  synth.triggerAttackRelease(notes[note3], "8n", now + angryOff2 + tiredOff2); 
}
