from flask import render_template
from flask import Flask
from flask import request
from flask import Response
from flask import jsonify
import json
import requests
import redis




app = Flask(__name__, static_folder='static', template_folder='template')
REDIS_CACHE = redis.Redis(host='localhost', port=6379, db=1)


@app.route('/')
def hello(name=None):
    import os
    print(os.getcwd())

    return render_template('index.html', name=name)


@app.route('/wave/api/v1.0/search', methods=['GET'])
def get_post_info():
    """
    Receives a hacker news post id
    Returns post info, with sibling and first two children
    """
    POSTID = request.args.get('post', default='*', type=str)
    headers = {"User-Agent": "Wave by heliopphobicdude"}
    data = get_single_post_data(POSTID, headers)
        

    # print("This is data")
    # print(data.keys())
    print('About to operate on postId: ', POSTID)
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

def get_single_post_data(POSTID, headers):
    data = REDIS_CACHE.get(POSTID)
    if data is not None and data.decode() != "":
        data = json.loads(data.decode())
        # print(type(data))
        # print("data: " + str(data))
        print("getting from cache: ", POSTID)
    else:
        r = requests.get(
            'https://hacker-news.firebaseio.com/v0/item/' +
            POSTID +
            '.json?print=pretty',
            headers=headers)
        data = r.json()
        # print("from hn", data)
        REDIS_CACHE.set(POSTID, json.dumps(data), ex=60)
        print("adding to cache: ", POSTID)
    return data

if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)
