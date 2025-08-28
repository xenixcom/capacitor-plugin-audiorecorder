import { AudioRecorder } from '@xinexcom/capacitor-plugin-audiorecorder';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    AudioRecorder.echo({ value: inputValue })
}
