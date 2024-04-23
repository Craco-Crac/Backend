import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserStats(BaseModel):
    id: str = Field()
    messages_count: int = Field()
    guess_count: int = Field()
    draws_count: int = Field()
    games_count: int = Field()
    round_count: int = Field()
    win_count: int = Field()

    time_played_as_player: int = Field()
    time_played_as_painter: int = Field()

    registered_at: datetime = Field(default_factory=datetime.utcnow)






