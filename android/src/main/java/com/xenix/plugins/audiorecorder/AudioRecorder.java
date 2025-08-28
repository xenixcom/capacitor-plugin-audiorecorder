package com.xenix.plugins.audiorecorder;

import com.getcapacitor.Logger;

public class AudioRecorder {

    private final AudioRecorderPlugin plugin;
    private String state = "idle";
    private static final String VERSION = "Android 0.0.1";

    public AudioRecorder(AudioRecorderPlugin plugin) {
        this.plugin = plugin;
    }

    public String getVersion() {
        return VERSION;
    }

    public void start() {
        Logger.info("[AudioRecorderAndroid]", "start");
        state = "recording";
        plugin.notifyStateChanged(state);
    }

    public void stop() {
        Logger.info("[AudioRecorderAndroid]", "stop");
        state = "idle";
        plugin.notifyStateChanged(state);
    }

    public String getState() {
        return state;
    }    
}
