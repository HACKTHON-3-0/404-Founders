 
USE_PICAMERA2 = True
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
 
MIN_DETECTION_CONFIDENCE = 0.6
MIN_TRACKING_CONFIDENCE = 0.6
MAX_NUM_FACES = 1
 
CALIBRATION_SECONDS = 3.0
 
EAR_CLOSED_FRACTION = 0.72
CONSEC_FRAMES = 2          # frames eyes must stay closed to count as a blink
DOUBLE_BLINK_TIME = 1.0    # max seconds between two blinks to count as "double"
BLINK_REFRACTORY_TIME = 0.4  # ignore new blinks for this long right after one is counted
 
YAW_RIGHT_DEG = 15.0    # turn head right past this many degrees -> RIGHT
YAW_LEFT_DEG = 15.0     # turn head left past this many degrees  -> LEFT
PITCH_DOWN_DEG = 12.0   # tilt head down past this many degrees  -> DOWN (back)
PITCH_UP_DEG = 12.0     # tilt head up past this many degrees    -> UP (forward, explicit)
 
DIRECTION_SMOOTHING_WINDOW = 5
 
LOST_FACE_GRACE_FRAMES = 6
 
BT_PORT = "/dev/rfcomm0"
BT_BAUD = 9600
COMMAND_INTERVAL = 0.2
 
SHOW_PREVIEW_WINDOW = True