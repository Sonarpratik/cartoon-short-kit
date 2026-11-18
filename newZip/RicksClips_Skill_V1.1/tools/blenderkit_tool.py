"""BlenderKit search and download for the skill, using CB's logged-in add-on. Run inside Blender so the add-on's stored login is used (never printed):
  blender -b --python tools/blenderkit_tool.py -- search "fishing boat" ["crate" ...]
  blender -b --python tools/blenderkit_tool.py -- get <assetBaseId> <assetId> <name> <episode_folder>
Only Royalty Free / CC0 assets. Files are cached in library/blenderkit/<name>/ and logged in library/blenderkit_assets.md and <episode>/assets_log.md.
Do not run downloaded .blend scripts: Blender keeps script auto-run off in background mode with default preferences."""
import bpy, json, urllib.request, urllib.parse as U, sys, os, uuid
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = sys.argv[sys.argv.index("--") + 1:]
TOK = bpy.context.preferences.addons["bl_ext.user_default.blenderkit"].preferences.api_key
H = {"User-Agent": "BlenderKit-client", "Authorization": "Bearer " + TOK}
OK = ("royalty_free", "cc_zero")
def api(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url if url.startswith("http") else "https://www.blenderkit.com/api/v1/" + url, headers=H), timeout=60))
def row(a, q=""):
    d = a.get("dictParameters", {}); return dict(q=q, name=a.get("name"), base=a.get("assetBaseId"), id=a.get("id"), lic=a.get("license"), free=a.get("isFree"), can=a.get("canDownload"), author=(a.get("author") or {}).get("fullName"), faces=d.get("faceCount"), style=d.get("modelStyle"), score=a.get("score"))
if A[0] == "search":
    for q in A[1:]:
        d = api("search/?query=" + U.quote(q + " asset_type:model order:-score") + "&dict_parameters=1&page_size=25")
        rs = [r for r in (row(a, q) for a in d.get("results", [])) if r["lic"] in OK and r["can"] is not False]
        rs.sort(key=lambda r: (r["style"] not in ("anime", "2d_vector", "stylized", "low_poly", "toon"), -(r["score"] or 0)))
        print("BKQ", q, d.get("count"))
        for r in rs[:7]: print("BKR", json.dumps({k: r[k] for k in ("name", "base", "id", "lic", "author", "faces", "style", "score")}, ensure_ascii=True))
if A[0] == "get":
    base, aid, name, ep = A[1:5]; d = api("search/?query=" + U.quote("asset_base_id:%s asset_type:model" % base) + "&dict_parameters=1"); a = d["results"][0]; r = row(a)
    assert r["lic"] in OK, "licence not allowed: %s" % r["lic"]
    f = next(x for x in a["files"] if x["fileType"] == "blend"); info = api(f["downloadUrl"] + "?scene_uuid=" + str(uuid.uuid4())); dst = os.path.join(ROOT, "library", "blenderkit", name); os.makedirs(dst, exist_ok=True); p = os.path.join(dst, name + ".blend")
    with urllib.request.urlopen(urllib.request.Request(info["filePath"], headers={"User-Agent": "BlenderKit-client"}), timeout=300) as s: open(p, "wb").write(s.read())
    line = "- %s: \"%s\" by %s, licence %s, faces %s, https://www.blenderkit.com/asset-gallery-detail/%s/, file library/blenderkit/%s/%s.blend\n" % (name, r["name"], r["author"], r["lic"], r["faces"], r["id"], name, name)
    for lp in (os.path.join(ROOT, "library", "blenderkit_assets.md"), os.path.join(ep, "assets_log.md")): open(lp, "a", encoding="utf-8").write(line)
    print("BKGOT", name, os.path.getsize(p) // 1024, "KB", r["lic"], r["faces"])
