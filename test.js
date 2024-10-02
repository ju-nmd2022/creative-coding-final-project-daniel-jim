let handpose;
let video;
let hands = [];
let synth;
let tiredTimer = 0;
let timer = 0;
let interactionTimer = 10;
let interval = 25;

let gameStarted = false


let tiredOff1 = 0;
let tiredOff2 = 0;


let tiredMood = 0;

// Skala 1-100
let angryMood = 10;

let angryOff1 = 0;
let angryOff2 = 0;

// Chat GPT Formel
// let attackValue = maxValueAttack - ((angryMood - 1) / 99) * (maxValueAttack - minValueAttack);

// Attack Value Min Max
let minValueAttack = 0.05;
let maxValueAttack = 0.3;
let attackValue = maxValueAttack - ((angryMood - 1) / 99) * (maxValueAttack - minValueAttack);

// Release Value Min Max
let minValueRelease = 0.1;
let maxValueRelease = 0.5;
let releaseValue = maxValueRelease - ((angryMood - 1) / 99) * (maxValueRelease - minValueRelease);

// Distortion Value Min Max
let minValueDistortion = 0.01;
let maxValueDistortion = 0.3;
let distortionValue = minValueDistortion + ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);


const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

let gainNode;
let distortion; 

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

  if(angryMood < 70) {
    distortion.distortion = 0;
  }
}


function angryMoodUpdates(){

  //Synth Settings
  attackValue = maxValueAttack - ((angryMood - 1) / 99) * (maxValueAttack - minValueAttack);
  releaseValue = maxValueRelease - ((angryMood - 1) / 99) * (maxValueRelease - minValueRelease);
  synth.set({
    envelope: {
      attack: attackValue,
      release: releaseValue,
    },
  });

//Distortion
if (angryMood > 69){
  distortionValue = minValueDistortion + ((angryMood - 1) / 99) * (maxValueDistortion - minValueDistortion);
  distortion.distortion = distortionValue;
} else{
  distortion.distortion = 0;
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


  if(gameStarted){
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
          angryMood++;
          interval = interval - 0.08;
          angryOff1 = angryOff1 + 0.0004;
          angryOff2 = angryOff2 + 0.0006;
        }

        // Kontrollera om middle finger är uppsträckt för att sätta angryMood till 100
        if (middleFinger.y < thumb.y - 30 && middleFinger.y < indexFinger.y - 50 && middleFinger.y < ringFinger.y - 50 && middleFinger.y < pinky.y - 50 && interactionTimer > 10 && angryMood < 100) {
          angryMood = angryMood + (Math.random() * 5)
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

    angryMoodUpdates();
    console.log(angryMood);
    console.log(tiredMood);

    timer++;
    tiredTimer++;
    interactionTimer++;
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

  // Hämta den aktuella tiden från Tone.js
  let now = Tone.now();
  // Spela tre noter med små fördröjningar mellan
  synth.triggerAttackRelease(notes[note1], "8n", now); // Spela omedelbart
  synth.triggerAttackRelease(notes[note2], "8n", now + angryOff1 + tiredOff1); 
  synth.triggerAttackRelease(notes[note3], "8n", now + angryOff2 + tiredOff2); 
}
