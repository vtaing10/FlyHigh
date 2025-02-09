
from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import CORS to allow React requests
import os
import numpy as np
import cv2
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)  # ✅ Allow all origins to send requests (React can now communicate with Flask)

# THIS IS WHERE YOU LOAD THE AI MODEL
MODEL_PATH = os.path.join(os.path.dirname(__file__), "cloud_classifier.keras")
model = load_model(MODEL_PATH)

# all possible clouds in the dataset
class_names = ["Ac", "As", "Cb", "Cc", "Ci", "Cs", "Ct", "Cu", "Ns", "Sc", "St"]

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():
    # Check if a file is uploaded
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Validate file type, just in case
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        return jsonify({"error": "Invalid file format. Only JPG, JPEG, and PNG are allowed."}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Preprocess image for AI model
        img = cv2.imread(filepath)
        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        # Make prediction
        prediction = model.predict(img)
        predicted_index = np.argmax(prediction)
        predicted_class = class_names[predicted_index]
        confidence = np.max(prediction) * 100

        return jsonify({
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": f"{confidence:.2f}%"
        })

    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

if __name__ == "__main__":
    print("\n🚀 Flask is running! Open http://127.0.0.1:5000/ in your browser.\n")
    app.run(debug=True)


