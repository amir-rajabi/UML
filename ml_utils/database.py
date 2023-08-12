from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # Create the db instance here

class db_Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String(255), nullable=False)
    label = db.Column(db.Integer, nullable=False)
    prediction = db.Column(db.Integer, nullable=False)


def save_image_to_database(image_path, label, prediction):
    with db.app.app_context():
        image = db_Image(image_path=image_path, label=label, prediction=prediction)
        db.session.add(image)
        db.session.commit()