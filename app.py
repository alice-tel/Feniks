from datetime import datetime
import random
from flask import render_template, jsonify
from Feniks import app, db
from Feniks.model import Codes, CodeLinks

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/code/<int:puzzel>', methods=['GET'])
def code(puzzel):
    """Gets the code out of the database and sends it to the client"""
    # Get the first code in DB
    code_row = db.session.query(Codes).filter(Codes.puzzel_id == puzzel).first()
    if code_row is None or code_row.expiry_date.date() < datetime.today().date():
        if code_row is not None:
            db.session.delete(code_row)
        
        code_exist = True
        max_tries = 10

        while code_exist and max_tries > 0:
            new_code = random.randrange(1, 99999)
            code_exist = queryCodeExist(new_code)
            max_tries =- 1
        
        if code_exist == False:
            code_row = Codes(code=new_code, puzzel_id=puzzel)
            db.session.add(code_row)
            db.session.commit()

    code_srt = code_row.code
    # Put the found code in a dictionary
    data = {
        "code": code_srt
    }
    # Turn the dictionary in to a json and send it to the client
    return jsonify(data)

def queryCodeExist(code):
    return db.session.query(Codes).filter(Codes.code == code).first() is not None
    
        


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)