import cv2
import time
from collections import deque, Counter

import config
from face_utils import FaceTracker, classify_direction
from camera_stream import CameraStream
from bluetooth_comm import BluetoothLink


def calibrate(camera, tracker):
    """
    Ask the user to look straight at the camera with eyes open/relaxed for
    a few seconds. Average their EAR and head pose to get personal
    baselines, instead of relying on generic fixed thresholds.
    """
    print(f"\nCALIBRATION: Look straight at the camera, eyes open, "
          f"for {config.CALIBRATION_SECONDS:.0f} seconds...")

    ear_samples = []
    yaw_samples = []
    pitch_samples = []

    start = time.time()
    while time.time() - start < config.CALIBRATION_SECONDS:
        ret, frame = camera.read()
        if not ret:
            continue

        result = tracker.process(frame)
        if result is not None:
            ear_samples.append(result["ear"])
            yaw_samples.append(result["yaw"])
            pitch_samples.append(result["pitch"])

        if config.SHOW_PREVIEW_WINDOW:
            remaining = config.CALIBRATION_SECONDS - (time.time() - start)
            cv2.putText(frame, f"CALIBRATING... {remaining:.1f}s",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.imshow("Eye & Head Control", frame)
            cv2.waitKey(1)

    if not ear_samples:
        print("WARNING: No face detected during calibration. Using fallback defaults.")
        return 0.28, 0.0, 0.0  # rough generic EAR/yaw/pitch fallback

    baseline_ear = sum(ear_samples) / len(ear_samples)
    baseline_yaw = sum(yaw_samples) / len(yaw_samples)
    baseline_pitch = sum(pitch_samples) / len(pitch_samples)

    print(f"Calibration done. baseline_ear={baseline_ear:.3f}, "
          f"baseline_yaw={baseline_yaw:.1f}, baseline_pitch={baseline_pitch:.1f}\n")

    return baseline_ear, baseline_yaw, baseline_pitch


def main():
    camera = CameraStream()
    tracker = FaceTracker(
        frame_width=config.FRAME_WIDTH,
        frame_height=config.FRAME_HEIGHT,
        max_num_faces=config.MAX_NUM_FACES,
        min_detection_confidence=config.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence=config.MIN_TRACKING_CONFIDENCE,
    )
    bt = BluetoothLink()

    baseline_ear, baseline_yaw, baseline_pitch = calibrate(camera, tracker)
    closed_ear_threshold = baseline_ear * config.EAR_CLOSED_FRACTION

    frame_counter = 0
    last_blink_time = 0
    is_moving = False
    last_sent = None
    lost_face_counter = 0
    direction_history = deque(maxlen=config.DIRECTION_SMOOTHING_WINDOW)

    print("Starting eye/head control. Press 'q' in the preview window to quit.")

    try:
        while True:
            ret, frame = camera.read()
            if not ret:
                break

            result = tracker.process(frame)

            # ---------- FACE LOST HANDLING (with grace period) ----------
            if result is None:
                lost_face_counter += 1
                if lost_face_counter >= config.LOST_FACE_GRACE_FRAMES:
                    bt.send('S')
                    last_sent = 'S'
                    if config.SHOW_PREVIEW_WINDOW:
                        cv2.putText(frame, "NO FACE - STOPPED", (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                        cv2.imshow("Eye & Head Control", frame)
                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            break
                continue
            else:
                lost_face_counter = 0

            ear = result["ear"]
            yaw = result["yaw"]
            pitch = result["pitch"]

            # ---------- BLINK LOGIC (double blink = start/stop toggle) ----------
            if ear < closed_ear_threshold:
                frame_counter += 1
            else:
                if frame_counter >= config.CONSEC_FRAMES:
                    now = time.time()
                    if now - last_blink_time > config.BLINK_REFRACTORY_TIME:
                        print("Blink detected")
                        if now - last_blink_time <= config.DOUBLE_BLINK_TIME:
                            is_moving = not is_moving
                            print("Double blink -> moving =", is_moving)
                        last_blink_time = now
                frame_counter = 0

            # ---------- HEAD DIRECTION (3D pose, smoothed) ----------
            raw_direction = classify_direction(
                yaw, pitch, baseline_yaw, baseline_pitch,
                config.YAW_RIGHT_DEG, config.YAW_LEFT_DEG,
                config.PITCH_DOWN_DEG, config.PITCH_UP_DEG,
            )
            direction_history.append(raw_direction)

            # Majority vote over the recent window kills single-frame jitter
            smoothed_direction = Counter(direction_history).most_common(1)[0][0]

            if is_moving:
                if smoothed_direction == "LEFT":
                    cmd = 'L'
                elif smoothed_direction == "RIGHT":
                    cmd = 'R'
                elif smoothed_direction == "DOWN":
                    cmd = 'B'
                else:  # UP or CENTER
                    cmd = 'F'
            else:
                cmd = 'S'

            bt.send(cmd)
            last_sent = cmd

            if config.SHOW_PREVIEW_WINDOW:
                status = "MOVING" if is_moving else "STOPPED"
                cv2.putText(frame, f"EAR: {ear:.2f} (thr {closed_ear_threshold:.2f})",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"YAW: {yaw - baseline_yaw:+.1f}  PITCH: {pitch - baseline_pitch:+.1f}",
                            (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                cv2.putText(frame, f"HEAD: {smoothed_direction}  [{status}]",
                            (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(frame, f"SENT: {last_sent}",
                            (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                x1, y1, x2, y2 = result["bbox"]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.imshow("Eye & Head Control", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

    finally:
        bt.send('S')  # always leave the chair stopped on exit/crash
        camera.release()
        tracker.close()
        bt.close()
        if config.SHOW_PREVIEW_WINDOW:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    main()