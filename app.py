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




config = configparser.ConfigParser()
config.read('host.props')
WAVE_STATIC_URL = config.get('DEFAULT','host')
app = Flask(__name__, static_folder='static', template_folder='template')
REDIS_CACHE = redis.Redis(host='redis', port=6379, db=1)


@app.route('/')
def hello(name=None):
    import os
    print(os.getcwd())

    return render_template('index.html', name=name, WAVE_STATIC_URL=WAVE_STATIC_URL)


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



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)
