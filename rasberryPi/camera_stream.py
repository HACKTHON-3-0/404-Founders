# camera_stream.py
# Wraps either the Pi Camera Module (picamera2) or a USB webcam (cv2)
# behind one simple .read() / .release() interface, so main.py doesn't
# need to know which one is in use.

import cv2
import config


class CameraStream:
    def __init__(self):
        self.use_picamera2 = config.USE_PICAMERA2

        if self.use_picamera2:
            from picamera2 import Picamera2
            self.picam2 = Picamera2()
            cam_config = self.picam2.create_video_configuration(
                main={"size": (config.FRAME_WIDTH, config.FRAME_HEIGHT), "format": "RGB888"}
            )
            self.picam2.configure(cam_config)
            self.picam2.start()
        else:
            self.cap = cv2.VideoCapture(0)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
            if not self.cap.isOpened():
                raise RuntimeError("Cannot open USB camera at index 0")

    def read(self):
        """Returns (success: bool, frame: BGR numpy array) — same shape cv2 uses."""
        if self.use_picamera2:
            frame = self.picam2.capture_array()
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)  # picamera2 gives RGB
            return True, frame
        else:
            return self.cap.read()

    def release(self):
        if self.use_picamera2:
            self.picam2.stop()
        else:
            self.cap.release()

