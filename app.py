from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import redis
import json

app = Flask(__name__)
CORS(app, resources={r"/wave/api/*": {"origins": "http://localhost:3000"}})
REDIS_CACHE = redis.Redis(host='redis', port=6379, db=1)

TOP_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
ITEM_URL = 'https://hacker-news.firebaseio.com/v0/item/{}.json?print=pretty'
HEADERS = {"User-Agent": "Wave by heliophobicdude"}

def get_top_stories():
    data = REDIS_CACHE.get('top_stories')
    if data is not None and data.decode() != "":
        return json.loads(data.decode())
    else:
        r = requests.get(TOP_STORIES_URL, headers=HEADERS)
        data = r.json()
        REDIS_CACHE.set('top_stories', json.dumps(data), ex=300)  # Cache for 5 minutes
        return data

@app.route('/wave/api/v1.0/topStories', methods=['GET'])
def top_stories():
    stories = get_top_stories()
    limit = request.args.get('limit', default=30, type=int)
    stories = stories[:limit]
    result = [get_single_post_data(str(story_id)) for story_id in stories]
    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/wave/api/v1.0/search', methods=['GET'])
def get_post_info():
    post_id = request.args.get('post', default=None, type=str)
    if not post_id or post_id == '*':
        return jsonify({'error': 'Invalid post ID'}), 400
    try:
        data = get_single_post_data(post_id)
        if not data:
            return jsonify({'error': 'Post not found'}), 404
        result = format_post_data(data)
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/wave/api/v1.0/children', methods=['GET'])
def get_children():
    post_id = request.args.get('post', default='*', type=str)
    if post_id == 'null':
        response = jsonify({'error': 'post id cannot be null'})
        response.status_code = 400
        return response
    data = get_single_post_data(post_id)
    if 'kids' in data:
        kids = list(data['kids'])
        children = [get_single_post_data(str(kid)) for kid in kids]
        result = {'children': children}
    else:
        result = {'children': []}
    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

def get_single_post_data(post_id):
    data = REDIS_CACHE.get(post_id)
    if data is not None and data.decode() != "":
        data = json.loads(data.decode())
    else:
        r = requests.get(ITEM_URL.format(post_id), headers=HEADERS)
        data = r.json()
        REDIS_CACHE.set(post_id, json.dumps(data), ex=300000)
    return data

def format_post_data(data):
    result = {
        'id': data['id'],
        'time': data['time'],
        'type': data['type'],
        'deleted': data.get('deleted', False)
    }

    if not result['deleted']:
        result['by'] = data.get('by', 'Anonymous')

    if 'parent' in data:
        result['parent'] = data['parent']

    if 'kids' in data:
        result['kids'] = list(data['kids'])
    else:
        result['kids'] = []

    if data['type'] == 'comment' and not result['deleted']:
        result['text'] = data.get('text', '[No content]')
    elif data['type'] == 'story' and not result['deleted']:
        result['title'] = data.get('title', '[Deleted]')
        if 'url' in data:
            result['url'] = data['url']

    return result

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)