from flask import Flask, jsonify
from flask_login import current_user
from sqlalchemy import inspect, text
from .config import Config
from .extensions import db, login_manager


def ensure_schema_updates():
    inspector = inspect(db.engine)

    if "comments" in inspector.get_table_names():
        comment_columns = {column["name"] for column in inspector.get_columns("comments")}
        if "parent_id" not in comment_columns:
            db.session.execute(text("ALTER TABLE comments ADD COLUMN parent_id INTEGER"))
            db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "Authentication required"}), 401
    
    from .models import User, Video, Comment, Like, Subscription
    from .routes.video.routes import video_bp
    from .routes.social.routes import social_bp
    from .routes.user.routes import user_bp
    from .routes.auth.routes import auth_bp

    app.register_blueprint(video_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    with app.app_context():
        db.create_all()
        ensure_schema_updates()

    @app.route("/")
    def home():
        return {"message": "HowTube backend is running"}

    return app
