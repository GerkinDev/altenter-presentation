// Audio config
let audioSections=[];
let a = [];
let countDown = 6;
for(let i=0;i<7;i++){
    // Load and push sounds
	a.push(new Pizzicato.Sound({ 
        source: 'file',
        options: { path: "./assets/sounds/snd-0"+(i+1)+".mp3" }
    }, () => { // onLoad...
        countDown--;
        if (countDown === 0) {
            // all audio files are loaded
            for(let b=2;b<6;b++){
                a[b].on("end", ()=>{
                    a[b+1].play();
                });
            }
        }
    }));
}

audioSections.push(a[0]);
audioSections.push(a[1]);
audioSections.push(a[2]);

// Audio function
function playAudioSection( section, config ){
    if( section > 0 && section < audioSections.length ) {
        audioSections[section].play();    
    } else {
        return false;
    }
    
    return true;
}

// Get DOM elements
const $caption = $('figcaption');
const $sections = $caption.children('section');
const $progress = $('.progress');
const $progressIn = $progress.children('span');
const $image = $('img');
const $cursor = $('#cursor');
const $toggleSound = $('#toggle-sound');
const $soundIcon = $toggleSound.children('i');
const $toggleAutoPlay = $('#toggle-autoplay');
const $autoPlayIcon = $toggleAutoPlay.children('i');

// Set other vars
const cursorHeight = $cursor.outerHeight();
const soundStates = {
	false: 'fa-volume-up',
	true:  'fa-volume-off',
};
const autoPlayStates = {
	false: 'fa-play',
	true:  'fa-pause',
};

// Flags
let allowScroll = true;
let autoPlay = false;
let supportsSpeechSynthesis = false;
let currentUtter = null;

// Loadable data
let section = (() => {
	const hashMatch = location.hash.match(/^#section-(\d+)$/);
	return hashMatch ? Math.min(parseInt(hashMatch[1]), $sections.length) : 0;
})() - 1;
let soundEnabled = localStorage.getItem('soundDisabled') ? false : true;


const refreshScollAndCursor = target => {
	$sections.removeClass('active');
	target.addClass('active');
	const targetMiddle = getVMiddle(target);
	$cursor.stop().animate({top: targetMiddle - cursorHeight / 2});
	$caption.stop().animate({scrollTop: targetMiddle - $caption.height() / 2});
}
const changeSlide = (to, from) => {
	if(allowScroll){
		allowScroll = false;
		console.log(`Changing slide from ${from} to ${to}`);
		const target = $sections.get(to);
		// Do scroll
		refreshScollAndCursor($(target));
		// Update progress infos
		const frac = ((to + 1) / $sections.length);
		const percent = Math.round(frac * 1000) / 10 + '%';
		$progress.attr('data-progress', percent);
		$progressIn.css({width: percent});
		// Update image
		$image.attr('src', 'http://lorempixel.com/400/400/cats/');
		// For slides, expose the `doSlideTransition` method globally. It will take 3 parameters: from index, to index, & options hash
		window.doSlideTransition && doSlideTransition(from, to, {
			soundEnabled,
			autoPlay,
			fullScreen: false,
		});
		// Start speech synthesis
		speechForElement(target);
		// Finalize
		section = to;
		location.hash = target.id;
		setTimeout(() => {
			allowScroll = true;
		}, 250);
	} else {
		console.warn('Scroll not yet authorized');
	}
}
const handleScroll = event => {
	event.preventDefault();
	if(event.originalEvent.wheelDelta /120 > 0) {
		if(section > 0){
			changeSlide(section - 1, section);
		} else {
			console.warn('Can\'t go to previous section');
		}
	} else {
		if(section < $sections.length - 1){
			changeSlide(section + 1, section);
		} else {
			console.warn('Can\'t go to next section');
		}
	}
	return false;
}
const getVMiddle = element => parseInt(element.css('marginTop')) + element.height() / 2 + element.position().top + element.parent().scrollTop();
const getTextFromDomElement = element => element.textContent;
const speechForElement = element => {
	// For audio sections prepared, expose the global method `playAudioSection`, that takes the index of the section, and an object reflecting current configuration. This function have to return a truthy value if it knows that section. If it returns a falsey value, the default speech synthesis will be used
	if(window.playAudioSection && playAudioSection(section, {
		soundEnabled,
		autoPlay,
		fullScreen: false,
	})){
		// Function call already done
	} else if(supportsSpeechSynthesis && soundEnabled){
		speechSynthesis.cancel();
		currentUtter = new SpeechSynthesisUtterance(getTextFromDomElement(element));
		currentUtter.voice = getVoice(document.documentElement.lang);
		speechSynthesis.speak(currentUtter);
		$(currentUtter).on('end', maybeAutoPlayNext);
	}
}
const getVoice = lang => {
	lang = lang || 'en';
	const validVoices = speechSynthesis.getVoices().filter(voice => {
		return voice.lang.startsWith(lang);
	});
	return validVoices[0];
}
const maybeAutoPlayNext = () => {
	currentUtter = null;
	if(autoPlay){
		setTimeout(changeSlide.bind(null, section + 1, section), 1000);
	}
}

// Bind events
$caption.on('DOMMouseScroll mousewheel', handleScroll);
$(window).resize(() => {
	if(section !== -1){
		refreshScollAndCursor($($sections.get(section)));
	}
});
$toggleSound.click(() => {
	soundEnabled = !soundEnabled;
	$soundIcon.removeClass(soundStates[!soundEnabled]).addClass(soundStates[soundEnabled]);
	if(soundEnabled){
		localStorage.removeItem('soundDisabled');
	} else {
		localStorage.setItem('soundDisabled', 'yes');
	}
	if(currentUtter && !soundEnabled){
		speechSynthesis.cancel();
	}
});
$toggleAutoPlay.click(() => {
	autoPlay = !autoPlay;
	$autoPlayIcon.removeClass(autoPlayStates[!autoPlay]).addClass(autoPlayStates[autoPlay]);
});
if(typeof speechSynthesis !== 'undefined'){
	supportsSpeechSynthesis = true;
}

// Initialize DOM
$(document).ready(() => {
	$soundIcon.addClass(soundStates[soundEnabled]);
	$autoPlayIcon.addClass(autoPlayStates[autoPlay]);
	$cursor.css({top: getVMiddle($caption.find('h1,h2,h3,h4,h5,h6')) - cursorHeight / 2});
	$progressIn.css({width: '0%'});
	$sections.each((index, section) => {
		section.id = `section-${index + 1}`;
	});
	if(section !== -1){
		$(speechSynthesis).on('voiceschanged', () => {
			changeSlide(section, -1);
		});
	}
});
