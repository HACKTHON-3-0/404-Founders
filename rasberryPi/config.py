# config.py
# All tunable settings live here so you don't have to dig through the logic.

# ---------------- CAMERA ----------------
# True  -> use the Raspberry Pi Camera Module via picamera2/libcamera
# False -> use a USB webcam via OpenCV (cv2.VideoCapture)
USE_PICAMERA2 = True
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# ---------------- DLIB MODEL ----------------
# Path to the 68-point face landmark model (see setup guide to download it)
SHAPE_PREDICTOR_PATH = "shape_predictor_68_face_landmarks.dat"

# ---------------- BLINK DETECTION ----------------
EAR_THRESHOLD = 0.20       # eye aspect ratio below this = "closed"
CONSEC_FRAMES = 3          # frames eyes must stay closed to count as a blink
DOUBLE_BLINK_TIME = 1.0    # max seconds between two blinks to count as "double"

# ---------------- HEAD DIRECTION ----------------
HEAD_RIGHT_RATIO = 1.3
HEAD_LEFT_RATIO = 0.75

# ---------------- BLUETOOTH (to Arduino/HC-05) ----------------
BT_PORT = "/dev/rfcomm0"   # bound with `sudo rfcomm bind 0 <HC-05 MAC> 1`
BT_BAUD = 9600
COMMAND_INTERVAL = 0.2     # min seconds between resending the same command

# ---------------- DISPLAY ----------------
# Set to False if running headless (no monitor/desktop) to skip cv2.imshow
SHOW_PREVIEW_WINDOW = True
