def test_add_comment(client):
    create_video = client.post("/videos/", json={
        "title": "Comment Video",
        "description": "Video for comments",
        "file_path": "/videos/comment.mp4",
        "creator_id": 1
    })

    video_id = create_video.get_json()["id"]

    response = client.post("/social/comments", json={
        "content": "Nice video!",
        "user_id": 1,
        "video_id": video_id
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["content"] == "Nice video!"
    assert data["user_id"] == 1
    assert data["video_id"] == video_id


def test_toggle_like(client):
    create_video = client.post("/videos/", json={
        "title": "Like Video",
        "description": "Video for likes",
        "file_path": "/videos/like.mp4",
        "creator_id": 1
    })

    video_id = create_video.get_json()["id"]

    response1 = client.post("/social/likes/toggle", json={
        "user_id": 1,
        "video_id": video_id
    })
    assert response1.status_code == 200
    assert response1.get_json()["liked"] is True

    response2 = client.post("/social/likes/toggle", json={
        "user_id": 1,
        "video_id": video_id
    })
    assert response2.status_code == 200
    assert response2.get_json()["liked"] is False


def test_subscribe(client):
    response = client.post("/social/subscribe", json={
        "subscriber_id": 1,
        "creator_id": 2
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["subscriber_id"] == 1
    assert data["creator_id"] == 2