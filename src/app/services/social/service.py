from ...extensions import db
from ...models.comment import Comment
from ...models.like import Like
from ...models.subscription import Subscription


class SocialService:
    @staticmethod
    def add_comment(content, user_id, video_id):
        comment = Comment(content=content, user_id=user_id, video_id=video_id)
        db.session.add(comment)
        db.session.commit()
        return comment

    @staticmethod
    def toggle_like(user_id, video_id):
        existing_like = Like.query.filter_by(user_id=user_id, video_id=video_id).first()

        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return {"liked": False}

        like = Like(user_id=user_id, video_id=video_id)
        db.session.add(like)
        db.session.commit()
        return {"liked": True}

    @staticmethod
    def subscribe(subscriber_id, creator_id):
        existing = Subscription.query.filter_by(
            subscriber_id=subscriber_id,
            creator_id=creator_id,
        ).first()

        if existing:
            return existing

        subscription = Subscription(
            subscriber_id=subscriber_id,
            creator_id=creator_id,
        )
        db.session.add(subscription)
        db.session.commit()
        return subscription