# face_utils.py
import numpy as np
from scipy.spatial import distance as dist

def shape_to_np(shape):
    coords = np.zeros((68, 2), dtype=int)
    for i in range(68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def get_head_direction(shape, right_ratio, left_ratio, down_ratio=0.35):
    """Detect LEFT, RIGHT, DOWN or CENTER, normalized by face scale."""
    # Reference scale: distance between outer eye corners (36 = left outer, 45 = right outer)
    face_width = dist.euclidean(shape[36], shape[45])
    if face_width == 0:
        return "CENTER"

    # ---------- Left / Right ----------
    nose_x = shape[30][0]
    left_x = shape[1][0]
    right_x = shape[15][0]
    left_dist = nose_x - left_x
    right_dist = right_x - nose_x

    if right_dist > 0:
        ratio = left_dist / right_dist
        if ratio > right_ratio:
            return "RIGHT"
        elif ratio < left_ratio:
            return "LEFT"

    # ---------- Down ----------
    left_eye_y = (shape[36][1] + shape[39][1]) / 2
    right_eye_y = (shape[42][1] + shape[45][1]) / 2
    eye_y = (left_eye_y + right_eye_y) / 2
    nose_y = shape[30][1]

    eye_to_nose = nose_y - eye_y
    normalized_drop = eye_to_nose / face_width  # scale-invariant

    if normalized_drop > down_ratio:
        return "DOWN"

    return "CENTER"
