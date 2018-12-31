import sys
import json
from flask import Flask
from flask import request
from flask import jsonify

import executor_utils as eu

app = Flask(__name__)


@app.route('/build_and_run', methods=['POST'])
def build_and_run():
    print("Got called with {}.".format(request.data))
    data = json.loads(request.data)

    if 'code' not in data or 'lang' not in data:
        return 'You should provide both code and language.'

    code = data['code']
    lang = data['lang']

    print('API called with code: {} in {}'.format(code, lang))

    result = eu.build_and_run(code, lang)
    return jsonify(result)


if __name__ == '__main__':
    eu.load_images()
    port = int(sys.argv[1])
    print 'Executor running on port {}.'.format(port)
    app.run(debug=True, port=port)
