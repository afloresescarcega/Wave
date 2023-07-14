from flask import render_template
from flask import Flask
from flask import request
from flask import Response
from flask import jsonify
import configparser
import json
import requests
import redis
import metadata_parser
import os
import urllib.parse

app = Flask(__name__, static_folder='static', template_folder='template')
REDIS_CACHE = redis.Redis(host='redis', port=6379, db=1)


@app.route('/')
def hello(name=None):
    import os
    print(os.getcwd())

    # Call get_single_post_data function with post id 36731490
    post_info = get_single_post_data('36731490')
        # Get info for all kids
    kids_info = [get_single_post_data(str(kid_id)) for kid_id in post_info['kids']]
    # Get info for all kids
    kids_info = [get_single_post_data(str(kid_id)) for kid_id in post_info['kids']]
    # Add post_info and kids_info to rowHistory
    rowHistory = [post_info, kids_info]
    # Pass the result to the render_template function
    return render_template('index.html', name=name, WAVE_STATIC_URL="localhost:8080", post_info=post_info, kids_info=kids_info, rowHistory=rowHistory)


@app.route('/wave/api/v1.0/search', methods=['GET'])
def get_post_info():
    """
    Receives a hacker news post id
    Returns post info, with sibling and first two children
    """
    post_id = request.args.get('post', default='*', type=str)
    data = get_single_post_data(post_id)

    print('About to operate on postId: ', post_id)
    result = {'id': data['id'], 'time': data['time'], 'by': data['by']}
    if 'parent' in data:
        result['parent'] = data['parent']
    if 'kids' in data:
        result['kids'] = list(data['kids'])
    else:
        result['kids'] = []
    if data['type'] == 'comment':
        result['text'] = data['text']
    elif data['type'] == 'story':
        result['title'] = data['title']
        if 'url' in data:
            result['url'] = data['url']
    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/wave/api/v1.0/children', methods=['GET'])
def get_children():
    """
    Receives a hacker news post id
    Returns the first two children of the post
    """
    post_id = request.args.get('post', default='*', type=str)
    if post_id == 'null':
        response = jsonify({'error': 'post id cannot be null'})
        response.status_code = 400
        return response
    data = get_single_post_data(post_id)

    print('About to operate on postId: ', post_id)
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
    headers = {"User-Agent": "Wave by heliophobicdude"}
    data = REDIS_CACHE.get(post_id)
    if data is not None and data.decode() != "":
        data = json.loads(data.decode())
        print("getting from cache: ", post_id)
    else:
        r = requests.get(
            'https://hacker-news.firebaseio.com/v0/item/' +
            post_id +
            '.json?print=pretty',
            headers=headers)
        data = r.json()
        REDIS_CACHE.set(post_id, json.dumps(data), ex=60)
        print("adding to cache: ", post_id)
    return data


# http://127.0.0.1:5000/wave/api/v1.0/hehe?url=https%3A%2F%2Ftheaviationgeekclub.com%2Fstory-behind-famed-sr-71-blackbird-super-low-knife-edge-pass%2F
@app.route('/wave/api/v1.0/hehe', methods=['GET'])
def get_post_image():
    urll = request.args.get('url', default='*', type=str)
    print("url: ", urll)
    print("decoded url: ", urllib.parse.unquote(urll))
    page = metadata_parser.MetadataParser(url=urllib.parse.unquote(urll))
    result = page.get_metadata_link('image')
    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/wave/api/v1.0/rowHistory', methods=['GET'])
def get_row_history():
    """
    Returns the rowHistory
    """
    if 'rowHistory' in globals():
        response = jsonify(globals()['rowHistory'])
    else:
        response = jsonify([])
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)
