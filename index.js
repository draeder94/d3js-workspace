const eq_buffer_slider = document.getElementById("eq_buffer_slider");
const eq_deb_slider = document.getElementById("eq_deb_slider");
const audio_context = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audio_context.createAnalyser();
let buffer_length;
function setAnalyserValues() {
	let val = 2 << (2+eq_buffer_slider.valueAsNumber);
	analyser.fftSize = val*2;
	buffer_length = analyser.frequencyBinCount;
	document.getElementById("eq_buffer_label").innerHTML = `Bandwith: ${val}`;
}
setAnalyserValues();
console.log("maxDeb: "+analyser.maxDecibels);

eq_buffer_slider.onchange = (event) => {
	setAnalyserValues();
};

eq_deb_slider.onchange = (event) => {
	let val = eq_deb_slider.valueAsNumber;
	analyser.maxDecibels = val;
	document.getElementById("eq_deb_label").innerHTML = `Sensitivity: ${val} dB`;
};


const eq_width = 1600;
const eq_height = 800;
const eq_width_bar = () => eq_width / buffer_length;
const value_array = new Uint8Array(256);
const eq_bars = () => d3.select("#eq").selectAll("rect").data(value_array);
eq_bars().enter()
	.append("rect")
	.style("stroke", "green").style("fill", "lightgreen")
	.attr("x", (p, i) => i * eq_width_bar())
	.attr("width", eq_width_bar())
	.attr("y", (b, i) => eq_height - eq_height * b/255)
	.attr("height", (b, i) => eq_height * b/255);

navigator.mediaDevices.getUserMedia({audio: true}).then(s => {
	audio_context.createMediaStreamSource(s).connect(analyser);
	updateVisuals();
});

function updateVisuals() {
	setTimeout(updateVisuals, 40);
	analyser.getByteFrequencyData(value_array);
	eq_bars().transition()
		.duration(100)
		.attr("x", (p, i) => i * eq_width_bar())
		.attr("width", eq_width_bar())
		.attr("height", (b, i) => eq_height * b/255)
		.attr("y", (b, i) => eq_height - eq_height * b/255);
}

