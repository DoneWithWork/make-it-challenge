
# main.py, flask backend
from flask import Flask, request, render_template, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from flask_migrate import Migrate
from flask_cors import CORS  # Import CORS

# Initialize the Flask application
application = Flask(__name__)
application.secret_key = 'your_secret_key'

current_directory = os.path.dirname(os.path.abspath(__file__))
# Set the upload folder to be in the same directory as the script
application.config['UPLOAD_FOLDER'] = os.path.join(current_directory, 'static/uploads')
application.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(current_directory, 'database.db')}"
# Ensure the upload directory exists
if not os.path.exists(application.config['UPLOAD_FOLDER']):
    os.makedirs(application.config['UPLOAD_FOLDER'])
# Initialize the database
db = SQLAlchemy(application)

# Initialize flask migrate
migrate = Migrate(application, db)

# Initialize CORS
CORS(application, supports_credentials=True)


# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)


# Define the Report model
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.String(150), nullable=False)
    longitude = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    tags = db.Column(db.String(150), nullable=True)
    urgency = db.Column(db.String(150), nullable=True)
    severity = db.Column(db.String(150), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    image_filename = db.Column(db.String(150), nullable=True)

# Ensure the database tables are created
with application.app_context():
    db.create_all()


# Routes
@application.route('/')
def landing():
    return jsonify({"message": "Welcome to the API"})


@application.route('/login', methods=['POST'])
def login():
   

    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@application.route('/register', methods=['POST'])
def register():
  
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409
    else:
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Registration successful"}), 201


@application.route('/upload', methods=['GET'])
def upload():
    print("Session contents:", session)
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"message": "Upload endpoint"})


@application.route('/docs', methods=['GET'])
def docs():
    print("Session contents:", session)
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"message": "Docs endpoint"})


@application.route('/submit', methods=['POST'])
def submit():

    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.form
    title = data.get('title')
    description = data.get('description')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    name = data.get('name')
    tags = data.get('tags')
    urgency = data.get('urgency')
    severity = data.get('severity')
    image = request.files.get('image')

    if not title or not description or not latitude or not longitude or not name or not image:
        return jsonify({"error": "All fields are required"}), 400
  
    filename = secure_filename(image.filename)
    print("filename:",filename)
    image.save(os.path.join(application.config['UPLOAD_FOLDER'], filename))

    new_report = Report(
        title=title,
        description=description,
        latitude=latitude,
        longitude=longitude,
        name=name,
        tags=tags,
        urgency=urgency,
        severity=severity,
        image_filename=filename
    )
    db.session.add(new_report)
    db.session.commit()
    return jsonify({"message": "Report submitted successfully"}), 201


@application.route('/reports', methods=['GET'])
def reports():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    report_id = request.args.get('id')
    if report_id:
        report = Report.query.get(report_id)
        if report:
            return jsonify(report.to_dict())
        else:
            return jsonify({"error": "Report not found"}), 404
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports])


@application.route('/edit/<int:id>', methods=['POST'])
def edit(id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    report = Report.query.get_or_404(id)
    data = request.form
    report.title = data.get('title', report.title)
    report.description = data.get('description', report.description)
    report.latitude = data.get('latitude', report.latitude)
    report.longitude = data.get('longitude', report.longitude)
    report.name = data.get('name', report.name)
    report.tags = data.get('tags', report.tags)
    report.urgency = data.get('urgency', report.urgency)
    report.severity = data.get('severity', report.severity)
    if 'status' in data:
        report.status = data['status']
    if 'image' in request.files:
        image = request.files['image']
        if image.filename:
            filename = secure_filename(image.filename)
            image.save(os.path.join(application.config['UPLOAD_FOLDER'], filename))
            report.image_filename = filename
    db.session.commit()
    return jsonify({"message": "Report updated successfully"})


@application.route('/admin', methods=['GET'])
def admin():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    if 'user_id' not in session or session.get('username') != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports])


@application.route('/admin/edit/<int:id>', methods=['POST'])
def admin_edit(id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    if 'user_id' not in session or session.get('username') != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    report = Report.query.get_or_404(id)
    data = request.form
    report.title = data.get('title', report.title)
    report.description = data.get('description', report.description)
    report.latitude = data.get('latitude', report.latitude)
    report.longitude = data.get('longitude', report.longitude)
    report.name = data.get('name', report.name)
    report.tags = data.get('tags', report.tags)
    report.urgency = data.get('urgency', report.urgency)
    report.severity = data.get('severity', report.severity)
    report.status = data.get('status', report.status)
    if 'image' in request.files:
        image = request.files['image']
        if image.filename:
            filename = secure_filename(image.filename)
            image.save(os.path.join(application.config['UPLOAD_FOLDER'], filename))
            report.image_filename = filename
    db.session.commit()
    return jsonify({"message": "Report updated successfully"})


@application.route('/api/reports', methods=['GET'])
def api_reports():
    report_id = request.args.get('id')
    if report_id:
        report = Report.query.get(report_id)
        return jsonify(report.to_dict())
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports])

@application.route('/api/getUsername', methods=['GET'])
def get_username():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({'username': user.username}), 200
    return jsonify({'error': 'Not logged in'}), 401

@application.route('/api/getIsLoggedIn', methods=['GET'])
def get_is_logged_in():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            is_admin = user.username == 'admin' if user.username else False
            return jsonify({'isLoggedIn': True, 'isAdmin': is_admin}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    return jsonify({'isLoggedIn': False}), 200

    
@application.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200
    
# Custom method to serialize Report objects
def report_to_dict(self):
    return {
        'id': self.id,
        'title': self.title,
        'description': self.description,
        'latitude': self.latitude,
        'longitude': self.longitude,
        'name': self.name,
        'tags': self.tags,
        'urgency': self.urgency,
        'severity': self.severity,
        'status': self.status,
        'timestamp': self.timestamp,
        'image_filename': self.image_filename
    }


Report.to_dict = report_to_dict

if __name__ == '__main__':
    application.run(debug=True, use_reloader=False, host='0.0.0.0', port=8080)
