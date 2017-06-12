from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request
from flask_bootstrap import Bootstrap

from flask_wtf import Form
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

from flask_sqlalchemy import SQLAlchemy
import json
import tempfile
import os


app = Flask(__name__)
app.config['SECRET_KEY'] = 'devkey'
print("SQLITE DATABASE PATH: " + os.path.join(tempfile.gettempdir(), 'test.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(tempfile.gettempdir(), 'test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


Bootstrap(app)
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(140))
    done = db.Column(db.Boolean)

    def __init__(self, text):
        self.text = text
        self.done = False

    def serialize(self):  
        return {
            'id': self.id,           
            'text': self.text, 
            'done': self.done
        }

db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/addTask", methods=['POST'])
def addTask():
    if request.method == "POST":
        task = Task(request.form['text'])
        db.session.add(task)
        db.session.commit()
        notDoneCount = Task.query.filter_by(done=False).count()
        return json.dumps({"task":task.serialize(),"notDoneCount":notDoneCount})

@app.route("/updateTask", methods=['POST'])
def updateTask():
    if request.method == "POST":
        task_id = request.form['id']
        task_done = request.form['done']

        if task_done == "true":
            Task.query.filter_by(id=task_id).update({"done": True})
        else:
            Task.query.filter_by(id=task_id).update({"done": False})

        task = Task.query.filter_by(id=task_id).first()
        db.session.commit()
        notDoneCount = Task.query.filter_by(done=False).count()
        return json.dumps({"task":task.serialize(),"notDoneCount":notDoneCount})

@app.route("/makeAllTasksDone", methods=['POST'])
def makeAllTasksComplete():
    if request.method == "POST":
        Task.query.update({"done": True})
        db.session.commit()
        return json.dumps({"message": "All tasks marked done", "notDoneCount":0});

@app.route("/getTasks", methods=['GET', 'POST'])
def getTasks():
    list_of_tasks = Task.query.all()
    notDoneCount = Task.query.filter_by(done=False).count()
    serialized_tasks = []
    for task in list_of_tasks:
        result = task.serialize()
        serialized_tasks.append(result)
    return jsonify({"tasks":serialized_tasks, "notDoneCount": notDoneCount})

if __name__ == "__main__":
    app.run(debug=True)
