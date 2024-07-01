
# main.py, flask backend
from flask import Flask, request, render_template, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from flask_migrate import Migrate
from flask_cors import CORS  # Import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt

# Initialize the Flask application
application = Flask(__name__)


application.secret_key = 'your_secret_key'

current_directory = os.path.dirname(os.path.abspath(__file__))
application.config['SECRET_KEY'] = 'your_strong_secret_key'
application.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
application.config['JWT_TOKEN_LOCATION'] = ['headers']

# Configure the application to store uploaded images in the static/uploads folder
application.config['UPLOAD_FOLDER'] = os.path.join(current_directory, 'static/uploads')
application.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(current_directory, 'database.db')}"

# jwt = JWTManager(application)
# Ensure the upload directory exists
if not os.path.exists(application.config['UPLOAD_FOLDER']):
    os.makedirs(application.config['UPLOAD_FOLDER'])

# Initialize the database
db = SQLAlchemy(application)

# Initialize flask migrate
migrate = Migrate(application, db)
jwt = JWTManager(application)
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

@application.route('/check_login', methods=['GET'])
def check_login():
    print("Session contents:", session)
    if 'username' in session:
        print("Session contents:", session)
        return jsonify(logged_in=True)
    return jsonify(logged_in=False)

@application.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        admin = user.username == 'admin'
        return jsonify({"message": "Login successful","token": access_token, "username": user.username, "user_id": user.id, "isAdmin": admin})
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
@jwt_required()
def submit():
    print("submit")
    user_id = get_jwt_identity()
    print("hi")
    print(user_id)
    user = User.query.filter_by(id=user_id).first()
    print("user:",user)
    if not user:
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
    return jsonify({"message": "Report submitted successfully","success":True}), 201






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
@jwt_required()
def admin():
    user_id = get_jwt_identity()
 
    user = User.query.filter_by(id=user_id).first()
   
    isAdmin = user.username == 'admin' if user.username else False
    print("isAdmin:", isAdmin)
    if not isAdmin:
        return jsonify({"error": "Unauthorized"}), 401
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports])

from datetime import timedelta,timezone
import json
application.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

@application.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

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


    
@application.route('/api/logout', methods=['POST'])
def logout():
    
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
