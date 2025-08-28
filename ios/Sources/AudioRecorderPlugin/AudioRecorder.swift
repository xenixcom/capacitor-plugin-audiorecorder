import Foundation

@objc public class AudioRecorder: NSObject {
    @objc public func echo(_ value: String) -> String {
        let s = value + " from ios"
        print("Echo: \(s)")
        return s
    }
}
