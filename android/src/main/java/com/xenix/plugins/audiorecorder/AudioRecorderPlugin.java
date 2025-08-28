package com.xenix.plugins.audiorecorder;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AudioRecorder")
public class AudioRecorderPlugin extends Plugin {

    private final AudioRecorder implementation = new AudioRecorder(this);

    @PluginMethod
    public void getVersion(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", implementation.getVersion());
        call.resolve(ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        implementation.start();
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        implementation.stop();
        call.resolve();
    }

    @PluginMethod
    public void removeAllListeners(PluginCall call) {
        // Capacitor handles this natively, but you can implement cleanup logic if needed
        call.resolve();
    }

    public void notifyStateChanged(String state) {
        JSObject data = new JSObject();
        data.put("state", state);
        notifyListeners("stateChanged", data);
    }
}
