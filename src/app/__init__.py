from flask import Flask
from .config import Config
from .extensions import db, login_manager


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)

    from .models import User, Video, Comment, Like, Subscription
    from .routes.video.routes import video_bp
    from .routes.social.routes import social_bp
    from .routes.user.routes import user_bp

    app.register_blueprint(video_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(user_bp)

    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return {"message": "HowTube backend is running"}

    return app