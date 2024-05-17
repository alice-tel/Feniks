from flask import render_template, jsonify
from Feniks import app, db
from Feniks.model import Codes, CodeLinks

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/code/', methods=['GET'])
def code():
    """Gets the code out of the database and sends it to the client"""
    # Get the first code in DB
    code_row = db.session.query(Codes).filter(Codes.id == 0).first()
    code_srt = code_row.code
    # Put the found code in a dictionary
    data = {
        "code": code_srt
    }
    # Turn the dictionary in to a json and send it to the client
    return jsonify(data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)