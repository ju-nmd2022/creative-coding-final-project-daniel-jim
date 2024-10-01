let handpose;
let video;
let hands = [];
let synth;
let timer = 0;
let mood;
const notes = ["Eb4_major", "F4_minor", "G4_minor", "Ab4_major", "Bb4_major", "C4_minor"];

let gainNode;

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose.detectStart(video, getHandsData);

  gainNode = new Tone.Gain(0.2).toDestination();  

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.2,
      release: 0.4,
    },
  }).connect(gainNode); 
}

function draw() {
  image(video, 0, 0, width, height);

  for (let hand of hands) {
    let indexFinger = hand.middle_finger_tip;
    let thumb = hand.thumb_tip;

    let centerX = (indexFinger.x + thumb.x) / 2;
    let centerY = (indexFinger.y + thumb.y) / 2;

    let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

    noStroke();
    fill(0, 0, 255);
    ellipse(centerX, centerY, distance);
  }

  if (timer > 15) {
    playNote();
    timer = 0;
  }
  timer++;
}

function getHandsData(results) {
  hands = results;
}

function playNote() {
  let note1 = Math.floor(Math.random() * 6);

  let note2 = note1 + 2;
  if(note2==7){
    note2=1;
  }else if(note2==8){
    note2=2;
  }

  let note3 = note2 + 2;
  if(note3==7){
    note3=1;
  }else if(note3==8){
    note3=2;
  }

  synth.triggerAttackRelease(notes[note1], "8n");
  synth.triggerAttackRelease(notes[note2], "8n");
  synth.triggerAttackRelease(notes[note3], "8n");

}
