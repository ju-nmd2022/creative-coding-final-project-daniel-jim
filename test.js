/*
NOTES!

- "Moodet"
1: Random variable som randomizas när det startar för alla 3, och det oftast runt 35-65, inget överdrivet.

1 egen variable
trött / pigg ( 0 - 100 )
- Tid på dygnet, (Väldigt tidigt / väldigt sen --> Sänker värdet)
  Övriga dags tider, (mitt på dan högst --> höjer värdet)

   - + på det redan satta randomet valuet

- Högt ljud (piggare) Lågt ljud (tröttare)

en / fler personer (under tid --> tröttare o tröttare, flera personer --> sjunker snabbare)








Högt ljud (random om han blir argare, eller gladare av det)


  arg / neutral  ( 0 - 100 )
  Om systemet blir trött, går även värdet här ner, mot att bli lite arg
  ()

  Pekar finger --> Arg direkt



  ledsen / glad ( 0 - 100 )
  Fler personer, gladare





DEL 2

Arg / Neutral 
mer volym, distortion, lite off (snarare för hetsig "snabbt" än för seg), 








*/




let handpose;
let video;
let hands = [];
let synth;
let timer = 0;
let mood;
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

let attackVariable = 0.5;
// Attack, lågt value = arg

let releaseVariable = 0.4;
//högt value = trött, kortare skulle kunna vara både piggt eller arg

let gainNode;

// C D EFGAB
// Mood 1 - Neutral
//Mood 2 - Glad
//Mood 3 - Ledsen
//Mood 4 - Arg
//Mood 5 - trött

// 1: Neutrala toner
// 2: Up lifting ---> :D
// 3: Lite deppigare, down tempo, mörkare
// 4: Hetsigt, lite off (kanske för "intense")
// 5: långsamt, lite off, men inte varken för mörkt eller ljust


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

  // for (let hand of hands) {
  //   let indexFinger = hand.middle_finger_tip;
  //   let thumb = hand.thumb_tip;

  //   let centerX = (indexFinger.x + thumb.x) / 2;
  //   let centerY = (indexFinger.y + thumb.y) / 2;

  //   let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

  //   noStroke();
  //   fill(0, 0, 255);
  //   ellipse(centerX, centerY, distance);
  // }
  

     if (hands.length > 0) {
       let indexFinger = hands[0].index_finger_tip;
       let thumb = hands[0].thumb_tip;
       let middleFinger = hands[0].middle_finger_tip;
       let ringFinger = hands[0].ring_finger_tip;
       let pinky = hands[0].pinky_finger_tip;

       fill(0, 255, 0);
       ellipse(indexFinger.x, indexFinger.y, 10);
       ellipse(thumb.x, thumb.y, 10);
       ellipse(middleFinger.x, middleFinger.y, 10);
       ellipse(ringFinger.x, ringFinger.y, 10);
       ellipse(pinky.x, pinky.y, 10);

       if (middleFinger.y < thumb.y- 30 && middleFinger.y < indexFinger.y- 50 && middleFinger.y < ringFinger.y- 50 && middleFinger.y < pinky.y - 50){
        console.log("TEST");
       }

     }

  if(timer > 25){
    playNote();
    timer = 0;
  }
  timer ++;
}

function getHandsData(results) {
  hands = results;
}

function playNote() {
    let note1 = Math.floor(Math.random() * 6);

    let note2 = note1 + 2;
    if (note2 == 7){
      note2 = 0;
    } else if (note2 == 8){
      note2 = 1;
    }

    let note3 = note2 + 2;
    if (note3 == 7){
      note3 = 0;
    } else if (note3 == 8){
      note3 = 1;
    }

    //let note = 
    synth.triggerAttackRelease(notes[note1], "8n");
    synth.triggerAttackRelease(notes[note2], "8n");
    synth.triggerAttackRelease(notes[note3], "8n");
    

}


