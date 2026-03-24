from flask import Blueprint, request, jsonify
from ...services.video.service import VideoService

video_bp = Blueprint("video", __name__, url_prefix="/videos")


@video_bp.route("/", methods=["GET"])
def list_videos():
    videos = VideoService.get_all_videos()
    return jsonify([video.to_dict() for video in videos]), 200


@video_bp.route("/<int:video_id>", methods=["GET"])
def get_video(video_id):
    video = VideoService.get_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    VideoService.increment_views(video)
    return jsonify(video.to_dict()), 200


@video_bp.route("/", methods=["POST"])
def create_video():
    data = request.get_json() or {}

    required_fields = ["title", "file_path", "creator_id"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    video = VideoService.create_video(
        title=data["title"],
        description=data.get("description"),
        file_path=data["file_path"],
        thumbnail_path=data.get("thumbnail_path"),
        creator_id=data["creator_id"],
    )

    return jsonify(video.to_dict()), 201


@video_bp.route("/<int:video_id>", methods=["PUT"])
def update_video(video_id):
    video = VideoService.get_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    data = request.get_json() or {}
    updated = VideoService.update_video(
        video,
        title=data.get("title"),
        description=data.get("description"),
        thumbnail_path=data.get("thumbnail_path"),
    )

    return jsonify(updated.to_dict()), 200


@video_bp.route("/<int:video_id>", methods=["DELETE"])
def delete_video(video_id):
    video = VideoService.get_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    VideoService.delete_video(video)
    return jsonify({"message": "Video deleted"}), 200