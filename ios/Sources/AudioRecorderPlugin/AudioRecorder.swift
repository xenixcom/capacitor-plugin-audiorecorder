import Foundation

@objc public class AudioRecorder: NSObject {
    private var state: String = "idle"
    private let version = "IOS 0.0.1"

    @objc public func getVersion() -> String {
        return version
    }

    @objc public func start() {
        print("[RecorderEngineIOS] start")
        state = "recording"
    }

    @objc public func stop() {
        print("[RecorderEngineIOS] stop")
        state = "idle"
    }

    @objc public func getState() -> String {
        return state
    }
}
