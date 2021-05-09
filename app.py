from flask import render_template
from flask import Flask

app = Flask(__name__, static_folder='static', template_folder='template')

@app.route('/')
def hello(name=None):
    import os
    print(os.getcwd())

    return render_template('index.html', name=name)
