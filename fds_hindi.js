

/**************************/
/** FORWARD DIGIT SPAN **/
/**************************/
/*
This module consists of an adaptive forward digit span (BDS)
task, commonly used as a measure of short-term memory.

On each trial, participant hear or see a string of digits. 
Then, participants have to click on buttons to report these 
digits in sequential order.

The script is easily customizable (e.g., audio or visual 
digit presentation, starting span, number of trials, etc.)
The task is adaptive based on a 1:2 staircase procedure -
that is, a correct answer will increase the span by one, 
whereas two incorrect answers in a row will decrease the
span by one.

The script outputs two important variables. The first is 
'fds_adaptive' which should be added to the experiment timeline
in the main html file -- e.g., timeline.push(fds_adaptive);

The second is 'return_fds_adaptive_folder' which should be pushed or
concatenated with other audio files for preloading purposes.
This is a function, so users can specify a different folder
name in the main html file

-- e.g., var foldername = return_fds_adaptive_folder();

The folder is not applicable if you are planning
on running a visual version of the task as no additional
files are needed.

Stephen Van Hedger, April 2020

*/


/**********************************/
/** Main Variables and Functions **/
/**********************************/

var useAudioHindi = true; // change to false if you want this to be a visual task!

var currentDigitListHindi; //current digit list
var folder = "digits/"; //folder name for storing the audio files
var fdsTrialNumHindi = 1; //counter for trials
var fdsTotalTrialsHindi = 12; //total number of desired trials
var responseHindi = []; //for storing partcipants' responseHindis
var fds_correct_ansHindi; //for storing the correct answer on a given trial
var staircaseCheckerHindi = []; //for assessing whether the span should move up/down/stay
var staircaseIndexHindi = 0; //index for the current staircase
// var digit_list = ['१', '२', '३', '४', '५', '६', '७', '८', '९']; //digits to be used (unlikely you will want to change this)

// var startingSpan = 3; //where we begin in terms of span
// var currentSpan; //to reference where participants currently are
var spanHistoryHindi = []; //easy logging of the participant's trajectory
var stimListHindi; //this is going to house the ordering of the stimuli for each trial
var idxHindi = 0; //for indexing the current letter to be presented
var exitLettersHindi; //for exiting the letter loop

const arrSumHindi = arr => arr.reduce((a,b) => a + b, 0) //simple variable for calculating sum of an array

//add to the dataframe whether the BDS was auditory or visual
jsPsych.data.addProperties({
BDS_modality: (useAudioHindi ? 'auditory' : 'visual')
});

//file map for use in the auditory implementation
var fileMapHindi = {
1: "hindi_1.wav",
2: "hindi_2.wav",
3: "hindi_3.wav",
4: "hindi_4.wav",
5: "hindi_5.wav",
6: "hindi_6.wav",
7: "hindi_7.wav",
8: "hindi_8.wav",
9: "hindi_9.wav"
};
	
//function to push button responseHindis to array
var recordClickHindi = function(elm) {
    responseHindi.push(Number(elm));
    document.getElementById("echoed_txt").innerHTML = responseHindi;
	}
	
//function to clear the responseHindi array
var clearresponseHindi = function() {
		responseHindi = [];
		document.getElementById("echoed_txt").innerHTML = responseHindi;
	}
	
//function to map digit names to audio files (for auditory BDS)
var digitToFileHindi = function (digit) {
		return folder + fileMapHindi[digit];
	};


//function to shuffle an array (Fisher-Yates)
function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

//function to get digit list for a trial
function getDigitList(len) {
	var shuff_final = [];
	//shuffle the digit list
	if(len <= digit_list.length) {
		shuff_final = shuffle(digit_list);
	} else {
		//this is overkill (generating too many digits) but it works and we slice it later anyway
		for (var j=0; j<len; j++){
			var interim_digits = shuffle(digit_list);
			shuff_final = [...shuff_final, ...interim_digits];
		}
	}	
	var digitList = shuff_final.slice(0,len); //array to hold the final digits
	return digitList;
}

//function to push the stimuli to an array
function getStimuliHindi(numDigits) {
	var digit;
	var stimListHindi = [];	
	currentDigitListHindi = getDigitList(numDigits);
	for (var i = 0; i < currentDigitListHindi.length; i += 1) {
		if (useAudioHindi) {
			digit = currentDigitListHindi[i];
			stimListHindi.push(digitToFileHindi(digit));		
		} else {
			digit = currentDigitListHindi[i].toString();
			stimListHindi.push('<p style="font-size:60px;font-weight:600;">' + digit + '</p>');
		}		  
	}
	fds_correct_ansHindi = currentDigitListHindi; //this is the reversed array for assessing performance
	return stimListHindi;
}

//function to update the span as appropriate (using a 1:2 staircase procedure)
function updateSpan() {
	//if they got the last trial correct, increase the span. 
	if (arrSumHindi(staircaseCheckerHindi) == 1) {
		currentSpan += 1; //add to the span if last trial was correct
		staircaseCheckerHindi = []; //reset the staircase checker
		staircaseIndexHindi = 0; //reset the staircase index
		//if they got the last two trials incorrect, decrease the span	
	} else if (arrSumHindi(staircaseCheckerHindi) == 0) {
		if(staircaseCheckerHindi.length == 2) {
			currentSpan -= 1; //lower the span if last two trials were incorrect
			if (currentSpan == 0) {
				currentSpan = 1; //make sure the experiment cannot break with exceptionally poor performance (floor of 1 digit)
			}
			staircaseCheckerHindi = []; //reset the staircase checker
			staircaseIndexHindi = 0; //reset the staircase index
		}
	} else {
		return false;
	}	
};


/******************/
/** Main Screens **/
/******************/

//From the Experiment Factory Repository 
var responseHindi_grid =
'<div class = numbox>' +
'<p>What were the numbers <b>in order</b>?<br>(When you are ready to lock in your answer, press ENTER)</p>' +
'<button id = button_1 class = "square num-button" onclick = "recordClickHindi(this.value)" value="1"><div class = content><img src="1.png"></div></button>' +
'<button id = button_2 class = "square num-button" onclick = "recordClickHindi(this.value)" value="2"><div class = content><img src="2.png"></div></button>' +
'<button id = button_3 class = "square num-button" onclick = "recordClickHindi(this.value)" value="3"><div class = content><img src="3.png"></div></button>' +
'<button id = button_4 class = "square num-button" onclick = "recordClickHindi(this.value)" value="4"><div class = content><img src="4.png"></div></button>' +
'<button id = button_5 class = "square num-button" onclick = "recordClickHindi(this.value)" value="5"><div class = content><img src="5.png"></div></button>' +
'<button id = button_6 class = "square num-button" onclick = "recordClickHindi(this.value)" value="6"><div class = content><img src="6.png"></div></button>' +
'<button id = button_7 class = "square num-button" onclick = "recordClickHindi(this.value)" value="7"><div class = content><img src="7.png"></div></button>' +
'<button id = button_8 class = "square num-button" onclick = "recordClickHindi(this.value)" value="8"><div class = content><img src="8.png"></div></button>' +
'<button id = button_9 class = "square num-button" onclick = "recordClickHindi(this.value)" value="9"><div class = content><img src="9.png"></div></button>' +
'<button class = clear_button id = "ClearButton" onclick = "clearresponseHindi()">Clear</button>'+
'<p><u><b>Current Answer:</b></u></p><div id=echoed_txt style="font-size: 30px; color:blue;"><b></b></div></div>' 



//Dynamic instructions based on whether it is an auditory or visual task   
var instructions;
if (useAudioHindi) {
	instructions = '<p>On each trial, you will hear a sequence of digits and be asked to type them back in the same order in which they were heard.</p>'+
				   '<p>For example, if you heard the digits <b style="color:blue;">one</b>, <b style="color:blue;">two</b>, '+
				   '<b style="color:blue;">three</b>, you would respond with <b style="color:blue;">1</b>, <b style="color:blue;">2</b>, <b style="color:blue;">3</b></p>';
} else {
	instructions = '<p>On each trial, you will see a sequence of digits and be asked to type them back in the same order in which they were seen.</p>'+
				   '<p>For example, if you saw the digits <b style="color:blue;">1</b>, <b style="color:blue;">2</b>, '+
				   '<b style="color:blue;">3</b>, you would respond with <b style="color:blue;">1</b>, <b style="color:blue;">2</b>, <b style="color:blue;">3</b></p>';
}

var fds_welcome = {
type: "html-button-response",
// stimulus: '<p>Welcome to the <b>digit span task.</b></p>' +instructions +
// 	'<p>To ensure high quality data, it is very important that you do not use any memory aid (e.g., pen and paper).<br>Please do the task solely in your head.</p>' +
// 	'<p>There will be '+fdsTotalTrialsHindi+' total trials. Participation takes around 10 minutes.</p>',
stimulus : '<p>Congrats! You are halfway through. Now we proceed onto the task with Hindi Numbers.</p>' +
	'<p>It is same as the previous experiment, with the only difference that now you would hear the digits in Hindi and answer the digits in Hindi numerals.</p>' +
	'<p>So, shall we continue?</p>',
choices: ['Continue']
};


//set-up screen
var setup_fds = {
type: 'html-button-response',
stimulus: function(){return '<p>Trial '+fdsTrialNumHindi+' of '+fdsTotalTrialsHindi+'</p>';},
choices: ['Begin'],
	post_trial_gap: 500,
	on_finish: function(){
		if(fdsTrialNumHindi == 1) {
			currentSpan = startingSpan;
		} 
		stimListHindi = getStimuliHindi(currentSpan); //get the current stimuli for the trial
		spanHistoryHindi[fdsTrialNumHindi-1]=currentSpan; //log the current span in an array	
		fdsTrialNumHindi += 1; //add 1 to the total trial count
		idxHindi = 0; //reset the index prior to the letter presentation
		exitLettersHindi = 0; //reset the exit letter variable
	}
};

//letter presentation      
var letter_fds = {
	type: 'audio-keyboard-response',
	stimulus: function(){return stimListHindi[idxHindi];},
	choices: jsPsych.NO_KEYS,
	post_trial_gap: 250,
	trial_ends_after_audio: true,
	on_finish: function(){
		idxHindi += 1; //update the index		
		//check to see if we are at the end of the letter array
		if (idxHindi == stimListHindi.length) {
			exitLettersHindi = 1;
		} else	{
			exitLettersHindi = 0;
		}	
	}
};

//visual letter presentation      
var letter_fds_vis = {
	type: 'html-keyboard-response',
	stimulus: function(){return stimListHindi[idxHindi];},
	choices: jsPsych.NO_KEYS,
	trial_duration: 500,
	post_trial_gap: 250,
	on_finish: function(){
		idxHindi += 1; //update the index		
		//check to see if we are at the end of the letter array
		if (idxHindi == stimListHindi.length) {
			exitLettersHindi = 1;
		} else	{
			exitLettersHindi = 0;
		}	
	}
};

//conditional loop of letters for the length of stimListHindi...different procedures for visual and audio
if(useAudioHindi){
	var letter_proc = {
		timeline: [letter_fds],
		loop_function: function(){
			if(exitLettersHindi == 0){
				return true;
			} else {
				return false;
			}
		}
	}
} else {
	var letter_proc = {
		timeline: [letter_fds_vis],
		loop_function: function(){
			if(exitLettersHindi == 0){
				return true;
			} else {
				return false;
			}
		}
	}
};

//responseHindi screen
var fds_responseHindi_screen = {
type: 'html-keyboard-response',
stimulus: responseHindi_grid,
choices: ['Enter'],
	on_finish: function(data){
		var curans = responseHindi;
		var corans = fds_correct_ansHindi;
		if(JSON.stringify(curans) === JSON.stringify(corans)) {
			var gotItRight = 1;
			staircaseCheckerHindi[staircaseIndexHindi] = 1;
		} else {
			var gotItRight = 0;
			staircaseCheckerHindi[staircaseIndexHindi] = 0;
		}
		responseHindi = []; //clear the responseHindi for the next trial
		staircaseIndexHindi += 1; //update the staircase index
		console.log(staircaseCheckerHindi);
		
		jsPsych.data.addDataToLastTrial({
			designation: 'FDS-HINDI',
			span: currentSpan, 
			answer: curans.toString(),
			correct: corans.toString(),
			was_correct: gotItRight,
			spanHistoryHindi: spanHistoryHindi
		});
	}	
};


/*********************/
/** Main Procedures **/
/*********************/

//call function to update the span if necessary
var staircase_assess = {
type: 'call-function',
func: updateSpan
}

//the core procedure
var staircase = {
timeline: [setup_fds, letter_proc, fds_responseHindi_screen, staircase_assess]
}

//main procedure
var fds_mainproc = {
	timeline: [staircase],
	loop_function: function(){
		//if we haev reached the specified total trial amount, exit
		if(fdsTrialNumHindi > fdsTotalTrialsHindi) {
			return false;
		} else {
			return true;
		}
	}	
};

/*************/
/** Wrap-Up **/
/*************/

var fds_wrapup = {
type: 'html-button-response',
stimulus: '<p>Thank you for your participation. This concludes the digit span.</p>',
choices: ['Exit']
};

/////////////////////////
// 1. final procedure //
////////////////////////
/*
Simply push this to your timeline 
variable in your main html files -
e.g., timeline.push(fds_adaptive)
*/

var fds_hindi = {
	timeline: [fds_welcome, fds_mainproc, fds_wrapup]
};

/////////////////////////////////
// 2. preload folder function //
////////////////////////////////
/*
If you wish to use the auditory
version of the task and need to
preload the stimuli, use this
function in the main html file 
to name the preload folder -
e.g., var fds_sounds = return_fds_adaptive_folder();
*/

var aud_digitsHindi = ['digits/hindi_1.wav', 'digits/hindi_2.wav', 'digits/hindi_3.wav', 'digits/hindi_4.wav', 'digits/hindi_5.wav', 'digits/hindi_6.wav', 'digits/hindi_7.wav', 'digits/hindi_8.wav', 'digits/hindi_9.wav'];
function return_fds_hindi_folder(){
		return aud_digitsHindi;
};


