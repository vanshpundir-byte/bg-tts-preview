import base64
import os
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from faster_whisper import WhisperModel

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

MODEL_NAME = os.getenv("WHISPER_MODEL", "large-v3")
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")

model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)


class TranscribeRequest(BaseModel):
  audio_base64: str
  language: Optional[str] = "auto"
  task: Optional[str] = "transcribe"


@app.get("/health")
def health():
  return {"status": "ok", "model": MODEL_NAME, "device": DEVICE}


@app.post("/transcribe")
def transcribe(payload: TranscribeRequest):
  if not payload.audio_base64:
    raise HTTPException(status_code=400, detail="audio_base64 is required")

  audio_base64 = payload.audio_base64
  if "," in audio_base64:
    audio_base64 = audio_base64.split(",", 1)[1]

  try:
    audio_bytes = base64.b64decode(audio_base64)
  except Exception as exc:
    raise HTTPException(status_code=400, detail="Invalid base64 audio") from exc

  tmp_path = None
  try:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
      tmp.write(audio_bytes)
      tmp_path = tmp.name

    language = payload.language if payload.language and payload.language != "auto" else None
    segments, info = model.transcribe(
      tmp_path,
      language=language,
      task=payload.task or "transcribe",
      vad_filter=True
    )
    text = "".join(segment.text for segment in segments).strip()
    return {
      "text": text,
      "language": info.language,
      "duration": info.duration
    }
  finally:
    if tmp_path and os.path.exists(tmp_path):
      os.remove(tmp_path)
