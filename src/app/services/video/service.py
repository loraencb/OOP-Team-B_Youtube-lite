from ...extensions import db
from ...models.video import Video


class VideoService:
    @staticmethod
    def create_video(title, description, file_path, creator_id, thumbnail_path=None):
        video = Video(
            title=title,
            description=description,
            file_path=file_path,
            thumbnail_path=thumbnail_path,
            creator_id=creator_id,
        )
        db.session.add(video)
        db.session.commit()
        return video

    @staticmethod
    def get_all_videos():
        return Video.query.order_by(Video.created_at.desc()).all()

    @staticmethod
    def get_video_by_id(video_id):
        return db.session.get(Video, video_id)

    @staticmethod
    def increment_views(video):
        video.views += 1
        db.session.commit()
        return video

    @staticmethod
    def update_video(video, title=None, description=None, thumbnail_path=None):
        if title is not None:
            video.title = title
        if description is not None:
            video.description = description
        if thumbnail_path is not None:
            video.thumbnail_path = thumbnail_path

        db.session.commit()
        return video

    @staticmethod
    def delete_video(video):
        db.session.delete(video)
        db.session.commit()