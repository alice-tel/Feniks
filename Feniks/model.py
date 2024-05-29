from datetime import datetime
from enum import Enum
from Feniks import db
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import CheckConstraint, ForeignKey

class LinkedType(Enum):
    skin = "skin"
    theme = "theme"

class TimestampMixin(object):
    created_at = db.Column(db.DateTime, default=datetime.now())
    udpates_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now)

class Scores(db.Model):
    __tablename__ = "scores"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement="auto", nullable=False)
    score: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    date: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now())

class Skins(db.Model):
    __tablename__ = "skins"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)

class Themes(db.Model):
    __tablename__ = "themes"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    
class Codes(db.Model):
    __tablename__ = "codes"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)
    code: Mapped[str] = mapped_column(nullable=False)
    expiry_date: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now())

class Descriptions(db.Model):
    __tablename__ = "descriptions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)
    linked_id: Mapped[int] = mapped_column(ForeignKey(Skins.id),ForeignKey(Themes.id), nullable=False)
    descriptions: Mapped[str] = mapped_column(nullable=False)

class CodeLinks(db.Model):
    __tablename__ = "code_links"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)

    # add linked_id, code_id columns
    code_id: Mapped[int] = mapped_column(ForeignKey(Codes.id), nullable=False)
    linked_id: Mapped[int] = mapped_column(ForeignKey(Skins.id),ForeignKey(Themes.id), nullable=False)
    linked_type: Mapped[LinkedType] = mapped_column(CheckConstraint(f"linked_type = '{ LinkedType.skin.value }' OR linked_type = '{ LinkedType.theme.value }'", name="right_type"),default=LinkedType.theme, nullable=False)