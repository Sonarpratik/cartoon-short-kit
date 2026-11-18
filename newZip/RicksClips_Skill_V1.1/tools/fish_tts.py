"""Fish Audio text-to-speech over the plain API (no connector).

Key: env FISH_API_KEY, else the first line of %USERPROFILE%/.fish_api_key (kept outside the project).
Usage: python tools/fish_tts.py <text.txt> <out.mp3> [--voice ID] [--model s2.1-pro] [--speed 1.0]
Default voice: "rick" bf223ba8059343d6b32bc1cbe0b4a586 (CB 2026-11-14, goldrush).
"""
import argparse, json, os, pathlib, sys, urllib.request, urllib.error

RICK = "bf223ba8059343d6b32bc1cbe0b4a586"


def api_key():
    k = os.environ.get("FISH_API_KEY", "").strip()
    if k:
        return k
    f = pathlib.Path.home() / ".fish_api_key"
    if f.exists():
        return f.read_text(encoding="utf-8").splitlines()[0].strip()
    sys.exit("No Fish key: set FISH_API_KEY or put it in %USERPROFILE%\\.fish_api_key")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("text")
    ap.add_argument("out")
    ap.add_argument("--voice", default=RICK)
    ap.add_argument("--model", default="s2.1-pro")
    ap.add_argument("--speed", type=float, default=1.0)
    a = ap.parse_args()
    text = pathlib.Path(a.text).read_text(encoding="utf-8").strip()
    body = {"text": text, "reference_id": a.voice, "format": "mp3", "mp3_bitrate": 192,
            "normalize": True, "latency": "normal", "prosody": {"speed": a.speed, "volume": 0}}
    req = urllib.request.Request("https://api.fish.audio/v1/tts", data=json.dumps(body).encode("utf-8"),
                                 headers={"Authorization": "Bearer " + api_key(), "Content-Type": "application/json",
                                          "model": a.model}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"Fish API {e.code}: {e.read()[:500].decode('utf-8', 'replace')}")
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(data)
    print(f"wrote {out} ({len(data)} bytes) voice={a.voice} model={a.model} speed={a.speed}")


if __name__ == "__main__":
    main()
