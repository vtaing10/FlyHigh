from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)  # ✅ Allow requests from React

# ✅ Load AI Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "cloud_classifier97_60.keras")
model = load_model(MODEL_PATH)

# ✅ Cloud class labels
class_names = ["Ac", "As", "Cb", "Cc", "Ci", "Cs", "Ct", "Cu", "Ns", "Sc", "St"]

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Function to Extract Frames from Video
def extract_frames(video_path, max_frames=10):
    cap = cv2.VideoCapture(video_path)
    frames = []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = max(1, total_frames // max_frames)

    for i in range(max_frames):
        frame_id = i * frame_interval
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (224, 224))  # Resize for model
        frame = frame / 255.0  # Normalize
        frames.append(frame)

    cap.release()
    return np.array(frames)

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_ext = file.filename.lower().split(".")[-1]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        if file_ext in ["jpg", "jpeg", "png"]:
            # ✅ Process as an Image
            img = cv2.imread(filepath)
            img = cv2.resize(img, (224, 224))
            img = img / 255.0  # Normalize
            img = np.expand_dims(img, axis=0)  # ✅ Ensure correct shape (batch dimension)
            frames = img  # Treat image as a single frame for consistency

        elif file_ext in ["mp4", "avi", "mov"]:
            # ✅ Process as a Video (Extract Frames)
            frames = extract_frames(filepath)

        else:
            return jsonify({"error": "Invalid file format. Only JPG, PNG, MP4, AVI, and MOV are allowed."}), 400

        # ✅ Make Predictions for Each Frame
        predictions = model.predict(frames)
        avg_prediction = np.mean(predictions, axis=0)  # Average across frames
        predicted_index = np.argmax(avg_prediction)
        predicted_class = class_names[predicted_index]
        confidence = np.max(avg_prediction) * 100

        return jsonify({
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": f"{confidence:.2f}%",
            "frames_analyzed": 1 if file_ext in ["jpg", "jpeg", "png"] else len(frames)  # Show frame count
        })

    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

if __name__ == "__main__":
    print("\n🚀 Flask is running! Open http://127.0.0.1:5000/ in your browser.\n")
    app.run(debug=True)
