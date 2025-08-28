import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(AudioRecorderPlugin)
public class AudioRecorderPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AudioRecorderPlugin"
    public let jsName = "AudioRecorder"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVersion", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = AudioRecorder()

    @objc func getVersion(_ call: CAPPluginCall) {
        call.resolve(["value": implementation.getVersion()])
    }

    @objc func start(_ call: CAPPluginCall) {
        implementation.start()
        notifyListeners("stateChanged", data: ["state": implementation.getState()])
        call.resolve()
    }

    @objc func stop(_ call: CAPPluginCall) {
        implementation.stop()
        notifyListeners("stateChanged", data: ["state": implementation.getState()])
        call.resolve()
    }

    override public func removeAllListeners(_ call: CAPPluginCall) {
        // 這裡可以放清理邏輯，如果不需要額外處理就呼叫父類別的實作
        super.removeAllListeners(call)
    }}
