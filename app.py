from flask import Flask, send_from_directory, jsonify, request
import json
import jwt
import datetime
import os

app = Flask(__name__)

# Secret key for encoding and decoding JWT tokens
app.config['SECRET_KEY'] = 'your-secret-key'

def create_token(email):
    """Create a JWT token"""
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'email': email, 'exp': expiration}, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def verify_token(token):
    """Verify JWT token"""
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/')
def index():
    return send_from_directory('front', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    # Serve static files from 'static' directory if they exist
    if os.path.isfile(os.path.join('static', path)):
        return send_from_directory('static', path)
    return send_from_directory('front', path)

@app.route('/api/places', methods=['GET'])
def get_places():
    with open('data/cities.json') as f:
        places = json.load(f)
    return jsonify(places)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    with open('data/users.json') as f:
        users = json.load(f)
    user = next((u for u in users if u['email'] == data['email'] and u['password'] == data['password']), None)
    if user:
        token = create_token(data['email'])
        return jsonify({'access_token': token})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/places/<place_id>', methods=['GET'])
def get_place_details(place_id):
    with open('data/places.json') as f:
        places = json.load(f)
    place = next((p for p in places if p['id'] == place_id), None)
    if place:
        return jsonify(place)
    return jsonify({'error': 'Place not found'}), 404

@app.route('/api/places/<place_id>/reviews', methods=['POST'])
def add_review(place_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    token = token.split(" ")[1]  # Strip 'Bearer ' prefix
    if not verify_token(token):
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    # Load current places data
    with open('data/places.json') as f:
        places = json.load(f)

    place = next((p for p in places if p['id'] == place_id), None)
    if not place:
        return jsonify({'error': 'Place not found'}), 404

    # Add review to the place
    if 'reviews' not in place:
        place['reviews'] = []
    place['reviews'].append(data.get('reviewText', ''))

    # Save the updated places data
    with open('data/places.json', 'w') as f:
        json.dump(places, f, indent=4)

    return jsonify({'message': 'Review added successfully'})

if __name__ == '__main__':
    app.run(debug=True)
