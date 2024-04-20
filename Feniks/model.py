import datetime
from Feniks import db

class TimestampMixin(object):
    created_at = db.Column(db.DateTime, default=datetime.now())
    udpates_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now)