def test_home_route(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.get_json()["message"] == "HowTube backend is running"


def test_create_video(client):
    response = client.post("/videos/", json={
        "title": "Backend Test Video",
        "description": "Testing create route",
        "file_path": "/videos/test.mp4",
        "creator_id": 1
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "Backend Test Video"
    assert data["creator_id"] == 1
    assert data["views"] == 0


def test_get_all_videos(client):
    client.post("/videos/", json={
        "title": "Video A",
        "description": "First",
        "file_path": "/videos/a.mp4",
        "creator_id": 1
    })

    response = client.get("/videos/")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_single_video_increments_views(client):
    create_response = client.post("/videos/", json={
        "title": "View Test",
        "description": "Testing views",
        "file_path": "/videos/view.mp4",
        "creator_id": 1
    })

    video_id = create_response.get_json()["id"]

    response1 = client.get(f"/videos/{video_id}")
    assert response1.status_code == 200
    assert response1.get_json()["views"] == 1

    response2 = client.get(f"/videos/{video_id}")
    assert response2.status_code == 200
    assert response2.get_json()["views"] == 2


def test_update_video(client):
    create_response = client.post("/videos/", json={
        "title": "Old Title",
        "description": "Old description",
        "file_path": "/videos/update.mp4",
        "creator_id": 1
    })

    video_id = create_response.get_json()["id"]

    update_response = client.put(f"/videos/{video_id}", json={
        "title": "New Title",
        "description": "New description"
    })

    assert update_response.status_code == 200
    data = update_response.get_json()
    assert data["title"] == "New Title"
    assert data["description"] == "New description"


def test_delete_video(client):
    create_response = client.post("/videos/", json={
        "title": "Delete Me",
        "description": "To be deleted",
        "file_path": "/videos/delete.mp4",
        "creator_id": 1
    })

    video_id = create_response.get_json()["id"]

    delete_response = client.delete(f"/videos/{video_id}")
    assert delete_response.status_code == 200

    get_response = client.get(f"/videos/{video_id}")
    assert get_response.status_code == 404

def test_feed_endpoint(client):
    client.post("/videos/", json={
        "title": "Feed Video",
        "description": "For feed",
        "file_path": "/videos/feed.mp4",
        "creator_id": 1
    })

    response = client.get("/videos/feed")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "like_count" in data[0]
    assert "comment_count" in data[0]

def test_get_video_stats(client):
    create_response = client.post("/videos/", json={
        "title": "Stats Video",
        "description": "Stats test",
        "file_path": "/videos/stats.mp4",
        "creator_id": 1
    })

    video_id = create_response.get_json()["id"]

    client.post("/social/comments", json={
        "content": "Nice stats",
        "user_id": 1,
        "video_id": video_id
    })

    client.post("/social/likes/toggle", json={
        "user_id": 1,
        "video_id": video_id
    })

    client.get(f"/videos/{video_id}")
    client.get(f"/videos/{video_id}")

    response = client.get(f"/videos/{video_id}/stats")
    assert response.status_code == 200

    data = response.get_json()
    assert data["video_id"] == video_id
    assert data["views"] == 2
    assert data["likes"] == 1
    assert data["comments"] == 1

def test_get_creator_videos(client):
    client.post("/videos/", json={
        "title": "Creator Video 1",
        "description": "One",
        "file_path": "/videos/one.mp4",
        "creator_id": 1
    })

    client.post("/videos/", json={
        "title": "Creator Video 2",
        "description": "Two",
        "file_path": "/videos/two.mp4",
        "creator_id": 1
    })

    response = client.get("/videos/creator/1")
    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 2