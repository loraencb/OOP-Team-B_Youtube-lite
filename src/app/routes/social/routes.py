from flask import Blueprint, request, jsonify
from ...services.social.service import SocialService

social_bp = Blueprint("social", __name__, url_prefix="/social")


@social_bp.route("/comments", methods=["POST"])
def add_comment():
    data = request.get_json() or {}
    required_fields = ["content", "user_id", "video_id"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    comment = SocialService.add_comment(
        content=data["content"],
        user_id=data["user_id"],
        video_id=data["video_id"],
    )

    return jsonify(comment.to_dict()), 201


@social_bp.route("/likes/toggle", methods=["POST"])
def toggle_like():
    data = request.get_json() or {}
    required_fields = ["user_id", "video_id"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    result = SocialService.toggle_like(
        user_id=data["user_id"],
        video_id=data["video_id"],
    )
    return jsonify(result), 200


@social_bp.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json() or {}
    required_fields = ["subscriber_id", "creator_id"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    subscription = SocialService.subscribe(
        subscriber_id=data["subscriber_id"],
        creator_id=data["creator_id"],
    )

    return jsonify({
        "id": subscription.id,
        "subscriber_id": subscription.subscriber_id,
        "creator_id": subscription.creator_id,
    }), 201