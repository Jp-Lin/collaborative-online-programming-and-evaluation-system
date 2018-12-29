import json
from flask import Flask
from flask import request
from flask import jsonify
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello, World!'
@app.route('/build_and_run', methods=['POST'])
def build_and_run():
  data = json.loads(request.data)

  if 'code' not in data or 'lang' not in data:
    return 'You should provide both code and language.'

  code = data['code']
  lang = data['lang']

  print('API called with code: {} in {}'.format(code, lang))

  return jsonify({})
if __name__ == '__main__':
    app.run(debug=True)