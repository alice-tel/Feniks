from datetime import datetime
from enum import Enum
from Feniks import db
from sqlalchemy.orm import Mapped, DeclarativeBase, mapped_column, relationship
from sqlalchemy import CheckConstraint

class LinkedType(Enum):
    skin = "skin"
    theme = "theme"

class Base(DeclarativeBase):
    pass

class TimestampMixin(object):
    created_at = db.Column(db.DateTime, default=datetime.now())
    udpates_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now)

class Skins(db.Model):
    __tablename__ = "skins"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)

class Codes(db.Model):
    __tablename__ = "codes"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(nullable=False)
    expiry_date: Mapped[datetime] = mapped_column(nullable=False)

class CodeLinks(Base):
    __tablename__ = "code_links"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    code_id: Mapped[int] = relationship(foreign_keys=Codes.id)
    linked_id: Mapped[int] = relationship(foreign_keys=Skins.id) # todo linked_id has only skins id as foreignkey and not skins and themes  
    linked_type: Mapped[LinkedType] = mapped_column(nullable=False)
    CheckConstraint("linked_type = 'skin' OR linked_type = 'theme'", name="right_type")
