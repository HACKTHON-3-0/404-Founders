# main.py
# Entry point: captures frames, runs face/eye/head detection, and sends
# L / R / F / S commands to the Arduino over Bluetooth.
#
# Safety model:
#   - Chair starts STOPPED (is_moving = False)
#   - A double blink toggles is_moving on/off
#   - Direction commands (L/R/F) are only sent while is_moving is True
#   - Losing face tracking always forces a STOP, regardless of state
#
# Run with:  python3 main.py

import cv2
import dlib
import time
import config
from face_utils import shape_to_np, eye_aspect_ratio, get_head_direction
from camera_stream import CameraStream
from bluetooth_comm import BluetoothLink


def largest_face(faces):
    """If multiple faces are detected, control from the biggest one (closest to camera)."""
    if len(faces) == 0:
        return None
    return max(faces, key=lambda f: f.width() * f.height())


def main():
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(config.SHAPE_PREDICTOR_PATH)
    camera = CameraStream()
    bt = BluetoothLink()

    frame_counter = 0
    last_blink_time = 0
    is_moving = False
    last_sent = None  # track what we last told the Arduino, for on-screen display only

    print("Starting eye/head control. Press 'q' in the preview window to quit.")

    try:
        while True:
            ret, frame = camera.read()
            if not ret:
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector(gray)
            face = largest_face(faces)

            if face is None:
                # No reliable tracking -> always stop, never keep coasting on the last command
                bt.send('S')
                last_sent = 'S'
                if config.SHOW_PREVIEW_WINDOW:
                    cv2.putText(frame, "NO FACE - STOPPED", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    cv2.imshow("Eye & Head Control", frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                continue

            shape = predictor(gray, face)
            shape = shape_to_np(shape)
            leftEye = shape[42:48]
            rightEye = shape[36:42]
            ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

            # ---------- BLINK LOGIC (double blink = start/stop toggle) ----------
            if ear < config.EAR_THRESHOLD:  
                frame_counter += 1
            else:
                if frame_counter >= config.CONSEC_FRAMES:
                    print("Blink detected") 
                    now = time.time()
                    if now - last_blink_time <= config.DOUBLE_BLINK_TIME:
                        is_moving = not is_moving
                        print("Double blink -> moving =", is_moving)
                    last_blink_time = now
                frame_counter = 0

            # ---------- HEAD DIRECTION (only acted on while moving is enabled) ----------
            direction = get_head_direction(shape, config.HEAD_RIGHT_RATIO, config.HEAD_LEFT_RATIO)

            if is_moving:
                if direction == "LEFT":
                    cmd = 'L'
                elif direction == "RIGHT":
                    cmd = 'R'
                elif direction  == "DOWN":
                    cmd = 'B'
                else:
                    cmd = 'F'
            else:
                cmd = 'S'

            bt.send(cmd)
            last_sent = cmd

            if config.SHOW_PREVIEW_WINDOW:
                status = "MOVING" if is_moving else "STOPPED"
                cv2.putText(frame, f"EAR: {ear:.2f}", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"HEAD: {direction}  [{status}]", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(frame, f"SENT: {last_sent}", (10, 90),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.imshow("Eye & Head Control", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

    finally:
        bt.send('S')  # always leave the chair stopped on exit/crash
        camera.release()
        bt.close()
        if config.SHOW_PREVIEW_WINDOW:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
