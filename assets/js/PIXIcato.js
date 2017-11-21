// Audio config
let a = [];
let audioSections = [];
let countDown = 6;
for ( let i = 0;i < 7;i++ ) {
	// Load and push sounds
	'file',
	a.push( new Pizzicato.Sound({
		source:  'file',
		options: {
			path: `./assets/sounds/snd-${ ( `00${   i + 1 }` ).slice( -2 ) }.mp3`,
		},
	}));
}
audioSections.push( a[0]);
audioSections.push( a[1]);
audioSections.push( a[2]);

// Export audio function
window.playAudioSection = ( section, config ) => {
	if ( section > -1 || section < audioSections.length ) {
		audioSections[section].play();
	} else {
		return false;
	}

	return true;
};



// Display config
let app = new PIXI.Application(400,400, {antialias: true, transparent:true});
document.getElementById("canvas").appendChild(app.view);

let stages = [];
stages.push(new PIXI.Container()); // 0
stages.push(new PIXI.Container()); // 1
stages.push(new PIXI.Container()); // 2
stages.push(new PIXI.Container()); // 3


let t0 = new PIXI.Text('Titre',{fontFamily : 'Arial', fontSize: 24, fill : 0x222222, align : 'center'});
let t1 = new PIXI.Text('1ère section',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
let t2 = new PIXI.Text('2ème section',{fontFamily : 'Arial', fontSize: 24, fill : 0x10ff10, align : 'center'});
let t3 = new PIXI.Text('3ème section',{fontFamily : 'Arial', fontSize: 24, fill : 0x1010ff, align : 'center'});

t0.position.x = 20;
t0.position.y = 20;
t1.position.x = 20;
t1.position.y = 100;
t2.position.x = 20;
t2.position.y = 200;
t3.position.x = 20;
t3.position.y = 300;

stages[0].addChild(t0);
stages[1].addChild(t1);
stages[2].addChild(t2);
stages[3].addChild(t3);

app.stage = stages[0];

// Export display function
window.doSlideTransition = ( from, to, config ) => {
	if ( to >= -1 || to < 3 ) {
        app.stage = stages[ to + 1 ];
	} else {
		return false;
	}

	return true;
};