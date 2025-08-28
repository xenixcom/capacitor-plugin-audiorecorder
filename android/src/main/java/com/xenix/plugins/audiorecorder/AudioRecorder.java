package com.xenix.plugins.audiorecorder;

import com.getcapacitor.Logger;

public class AudioRecorder {

    public String echo(String value) {
        value = value + " from android";
        Logger.info("Echo:", value);
        return value;
    }
}
